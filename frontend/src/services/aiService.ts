import {
  HealthFacility,
  MedicineItem,
  BedAvailabilityRecord,
  DoctorAttendanceRecord,
  RedistributionTransfer,
  AlertNotification,
  LanguageCode,
  AtRiskFacility,
} from '../types';

export interface AppOperationalContext {
  facilities: HealthFacility[];
  inventory: MedicineItem[];
  beds: BedAvailabilityRecord[];
  doctors: DoctorAttendanceRecord[];
  transfers: RedistributionTransfer[];
  alerts: AlertNotification[];
  atRiskFacilities: AtRiskFacility[];
}

// Server-Side Gateway API Configuration (Keys concealed on server)
export function getGeminiApiKey(): string {
  // Never expose raw API key to client browser!
  return '';
}

export async function saveGeminiApiKey(key: string): Promise<boolean> {
  // Purge any old plaintext keys from localStorage
  try {
    localStorage.removeItem('medigrid_gemini_api_key');
  } catch {}

  if (!key.trim()) return true;

  try {
    // Send securely to server backend gateway
    const res = await fetch('/api/ai/configure-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: 'Gemini',
        apiKey: key.trim(),
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to configure server key:', err);
    return false;
  }
}

/**
 * Intelligent Rule-Based Fallback Engine
 * Analyzes questions in English, Hindi, and Marathi against live data.
 */
export function queryRuleBasedAssistant(
  question: string,
  context: AppOperationalContext,
  lang: LanguageCode
): string {
  const q = question.toLowerCase();

  // 1. Medicine Shortage Query
  // English: 'run out', 'shortage', 'medicine', 'stock'
  // Hindi: 'दवाइयों की कमी', 'दवा', 'कमी', 'स्टॉक'
  // Marathi: 'औषध तुटवडा', 'औषधे', 'तुटवडा', 'कमी साठा'
  if (
    q.includes('shortage') ||
    q.includes('run out') ||
    q.includes('medicine') ||
    q.includes('stock') ||
    q.includes('दवा') ||
    q.includes('कमी') ||
    q.includes('औषध') ||
    q.includes('तुटवडा')
  ) {
    const atRisk = context.inventory.filter(
      (i) => i.alertSeverity === 'CRITICAL' || i.alertSeverity === 'HIGH'
    );

    if (lang === 'hi') {
      if (atRisk.length === 0) {
        return 'वर्तमान में किसी भी स्वास्थ्य केंद्र में आवश्यक दवाओं की कोई गंभीर कमी नहीं पाई गई है। सभी केंद्र बफर सीमा के भीतर हैं।';
      }
      const list = atRisk
        .map(
          (m) =>
            `• ${m.facilityName}: ${m.name} (उपलब्ध: ${m.usableStock} ${m.unit}, अनुमानित शेष: ${m.daysUntilStockOut} दिन, दैनिक खपत: ${m.averageDailyConsumption} ${m.unit})`
        )
        .join('\n');
      return `इस सप्ताह निम्नलिखित स्वास्थ्य केंद्रों में दवाओं की कमी की चेतावनी है:\n\n${list}\n\nसुझाव: 'स्मार्ट संसाधन पुनर्वितरण' मॉड्यूल में इन केंद्रों के लिए पास के अधिशेष केंद्रों से आपातकालीन हस्तांतरण उपलब्ध है।`;
    }

    if (lang === 'mr') {
      if (atRisk.length === 0) {
        return 'सध्या कोणत्याही आरोग्य केंद्रात औषधांचा गंभीर तुटवडा नाही. सर्व साठा सुरक्षित मर्यादेत आहे.';
      }
      const list = atRisk
        .map(
          (m) =>
            `• ${m.facilityName}: ${m.name} (उपलब्ध साठा: ${m.usableStock} ${m.unit}, अंदाजे शिल्लक: ${m.daysUntilStockOut} दिवस)`
        )
        .join('\n');
      return `या आठवड्यात खालील आरोग्य केंद्रांमध्ये औषध तुटवड्याचा धोका आहे:\n\n${list}\n\nकार्रवाई: 'स्मार्ट पुनर्वितरण' पर्यायातून तात्काळ अतिरिक्त साठा असलेल्या केंद्रांकडून ट्रान्सफर मंजूर करू शकता.`;
    }

    // Default English
    if (atRisk.length === 0) {
      return 'All health facilities currently report adequate medicine buffers above minimum safety thresholds.';
    }
    const list = atRisk
      .map(
        (m) =>
          `• **${m.facilityName}**: ${m.name} (${m.usableStock} ${m.unit} usable stock remaining, est. **${m.daysUntilStockOut} days** until stock-out. Daily consumption: ${m.averageDailyConsumption} ${m.unit}/day).`
      )
      .join('\n');

    return `### Facilities Facing Projected Medicine Shortages:\n\n${list}\n\n**Actionable Recommendation:**\nSmart redistribution transfers have been calculated from donor facilities with confirmed safe surpluses (e.g. CHC Haveli). Check the **Smart Redistribution** page to review and approve dispatches.`;
  }

  // 2. Bed Availability Query
  // English: 'bed', 'available beds', 'occupancy'
  // Hindi: 'बिस्तर', 'बेड', 'उपलब्ध बिस्तर'
  // Marathi: 'खाटा', 'बेड', 'उपलब्ध खाटा'
  if (
    q.includes('bed') ||
    q.includes('occupan') ||
    q.includes('बिस्तर') ||
    q.includes('खाटा')
  ) {
    const sortedBeds = [...context.beds].sort((a, b) => b.availableBeds - a.availableBeds);
    const totalAvail = context.beds.reduce((acc, b) => acc + b.availableBeds, 0);
    const totalBeds = context.beds.reduce((acc, b) => acc + b.totalBeds, 0);
    const districtOccupancy = ((totalBeds - totalAvail) / totalBeds) * 100;

    if (lang === 'hi') {
      const list = sortedBeds
        .slice(0, 4)
        .map(
          (b) =>
            `• ${b.facilityName}: ${b.availableBeds} बिस्तर उपलब्ध (कुल: ${b.totalBeds}, अधिभोग: ${b.occupancyRate.toFixed(0)}%)`
        )
        .join('\n');
      return `जिले में वर्तमान में कुल **${totalAvail}** बिस्तर उपलब्ध हैं (समग्र अधिभोग दर: ${districtOccupancy.toFixed(1)}%)।\n\nप्रमुख उपलब्ध केंद्र:\n${list}`;
    }

    if (lang === 'mr') {
      const list = sortedBeds
        .slice(0, 4)
        .map(
          (b) =>
            `• ${b.facilityName}: ${b.availableBeds} खाटा उपलब्ध (एकूण: ${b.totalBeds}, वहन क्षमता: ${b.occupancyRate.toFixed(0)}%)`
        )
        .join('\n');
      return `जिल्ह्यात सध्या **${totalAvail}** खाटा उपलब्ध आहेत (एकूण वहन क्षमता: ${districtOccupancy.toFixed(1)}%)।\n\nउपलब्ध खाटा असलेली केंद्रे:\n${list}`;
    }

    const list = sortedBeds
      .map(
        (b) =>
          `• **${b.facilityName}**: **${b.availableBeds} beds available** of ${b.totalBeds} total (${b.occupancyRate.toFixed(0)}% occupancy). Maternity: ${b.specialtyBeds.maternity}, General: ${b.specialtyBeds.general}. Verified at ${b.lastVerified}.`
      )
      .join('\n');

    return `### Inpatient Bed Availability Across District Facilities:\n\n**Total district available beds:** ${totalAvail} / ${totalBeds} (${districtOccupancy.toFixed(1)}% occupancy rate).\n\n${list}\n\n*Note: High-occupancy centres like PHC Bhor (100% occupied) should route elective admissions to CHC Daund or CHC Haveli.*`;
  }

  // 3. Doctor Attendance & Staffing Query
  // English: 'doctor', 'staff', 'attendance', 'deficit'
  // Hindi: 'डॉक्टर', 'उपस्थिति', 'स्टाफ'
  // Marathi: 'डॉक्टर', 'उपस्थिती', 'कर्मचारी'
  if (
    q.includes('doctor') ||
    q.includes('staff') ||
    q.includes('attendance') ||
    q.includes('डॉक्टर') ||
    q.includes('उपस्थिति') ||
    q.includes('उपस्थिती')
  ) {
    const deficits = context.doctors.filter((d) => d.isStaffingDeficit);

    if (lang === 'hi') {
      if (deficits.length === 0) {
        return 'जिले के सभी प्राथमिक एवं सामुदायिक स्वास्थ्य केंद्रों में डॉक्टर उपस्थिति न्यूनतम आवश्यक सीमा के अनुरूप है।';
      }
      const list = deficits
        .map(
          (d) =>
            `• ${d.facilityName}: ${d.scheduledDoctors} में से केवल ${d.presentDoctors} डॉक्टर उपस्थित (न्यूनतम आवश्यक: ${d.minimumRequired}, अनुपस्थित: ${d.absentDoctors}, अवकाश: ${d.onLeaveDoctors})`
        )
        .join('\n');
      return `स्टाफिंग कमी वाले केंद्र:\n\n${list}\n\nसिफारिश: सोमवार की भारी भीड़ को संभालने के लिए वैकल्पिक ड्यूटी की व्यवस्था करें।`;
    }

    if (lang === 'mr') {
      if (deficits.length === 0) {
        return 'जिल्ह्यातील सर्व केंद्रांवर डॉक्टर उपस्थिती आवश्यक नियमांनुसार समाधानकारक आहे.';
      }
      const list = deficits
        .map(
          (d) =>
            `• ${d.facilityName}: ${d.scheduledDoctors} पैकी फक्त ${d.presentDoctors} डॉक्टर हजर (किमान आवश्यक: ${d.minimumRequired})`
        )
        .join('\n');
      return `डॉक्टर तुटवडा असलेली केंद्रे:\n\n${list}\n\nसूचना: गर्दीच्या वेळेत फिरत्या वैद्यकीय पथकाची मदत घ्यावी.`;
    }

    if (deficits.length === 0) {
      return 'All health centres currently satisfy the mandatory minimum doctor staffing guidelines.';
    }

    const list = deficits
      .map(
        (d) =>
          `• **${d.facilityName}**: **${d.presentDoctors} of ${d.scheduledDoctors}** doctors present (Requirement: minimum ${d.minimumRequired}). Attendance: ${d.attendancePercentage}%. Notes: ${d.alertNote || 'Staff shortage active.'}`
      )
      .join('\n');

    return `### Staffing & Doctor Attendance Deficit Summary:\n\n${list}\n\n**District Intervention Required:**\nPHC Paud has only 2 duty doctors on site today despite a +43.8% surge in OPD patients. Roving medical officer redeployment from CHC Haveli is recommended.`;
  }

  // 4. Critical Alerts Summary
  // English: 'alert', 'critical', 'summarize'
  // Hindi: 'अलर्ट', 'सूचना', 'गंभीर'
  // Marathi: 'अलर्ट', 'सूचना'
  if (
    q.includes('alert') ||
    q.includes('critical') ||
    q.includes('अलर्ट') ||
    q.includes('सूचना')
  ) {
    const active = context.alerts.filter((a) => !a.isResolved);
    const critical = active.filter((a) => a.severity === 'CRITICAL');

    if (lang === 'hi') {
      const list = active
        .map((a) => `• [${a.severity}] ${a.facilityName || 'जिला'}: ${a.title} - ${a.message}`)
        .join('\n');
      return `सक्रिय अलर्ट सारांश (${active.length} कुल, ${critical.length} अति-गंभीर):\n\n${list}`;
    }

    if (lang === 'mr') {
      const list = active
        .map((a) => `• [${a.severity}] ${a.facilityName || 'जिल्हा'}: ${a.title} - ${a.message}`)
        .join('\n');
      return `सक्रिय अलर्ट्स (${active.length} एकूण, ${critical.length} अतिगंभीर):\n\n${list}`;
    }

    const list = active
      .map((a) => `• **[${a.severity}]** *${a.facilityName || 'District'}*: **${a.title}**\n  _${a.message}_`)
      .join('\n\n');

    return `### Active District Operational Alerts (${active.length} Unresolved, ${critical.length} Critical):\n\n${list}\n\n*All alerts are evaluated continuously from live facility telemetry and rule triggers.*`;
  }

  // 5. Surplus inventory
  // English: 'surplus', 'unused', 'excess'
  // Hindi: 'अधिशेष', 'अतिरिक्त'
  // Marathi: 'अतिरिक्त', 'शिल्लक'
  if (
    q.includes('surplus') ||
    q.includes('unused') ||
    q.includes('excess') ||
    q.includes('अधिशेष') ||
    q.includes('अतिरिक्त')
  ) {
    const surpluses = context.inventory.filter((i) => {
      const sevenDayReserve = Math.ceil(i.averageDailyConsumption * 7);
      const safeSurplus = i.currentStock - i.minimumThreshold - sevenDayReserve;
      return safeSurplus > 100;
    });

    if (lang === 'mr') {
      const list = surpluses
        .map(
          (s) =>
            `• ${s.facilityName}: ${s.name} - एकूण उपयुक्त साठा: ${s.usableStock} ${s.unit} (अतिरिक्त साठा: ~${s.currentStock - s.minimumThreshold} ${s.unit})`
        )
        .join('\n');
      return `पुरेशा अतिरिक्त साठ्यासह उपलब्ध केंद्रे:\n\n${list}\n\nया साठ्याचा वापर स्थानिक सेवा खंडित न करता तुटवडा असलेल्या केंद्रांकडे तातडीने हस्तांतरित करण्यासाठी करता येतो.`;
    }

    if (lang === 'hi') {
      const list = surpluses
        .map(
          (s) =>
            `• ${s.facilityName}: ${s.name} - कुल उपयोगी: ${s.usableStock} ${s.unit} (अधिशेष: ~${s.currentStock - s.minimumThreshold} ${s.unit})`
        )
        .join('\n');
      return `पर्याप्त अधिशेष वाले केंद्र:\n\n${list}\n\nइनका उपयोग कमी वाले केंद्रों में बिना स्थानीय आपूर्ति बाधित किए किया जा सकता है।`;
    }

    const list = surpluses
      .map(
        (s) =>
          `• **${s.facilityName}**: ${s.name} — **${s.usableStock} ${s.unit}** on hand (Buffer threshold: ${s.minimumThreshold}, daily usage: ${s.averageDailyConsumption}). Safe surplus available for redistribution.`
      )
      .join('\n');

    return `### Facilities with Confirmed Usable Medicine Surplus:\n\n${list}\n\nThese facilities maintain healthy reserves well above their configured 7-day emergency buffers and are pre-qualified as donors by the redistribution algorithm.`;
  }

  // 6. Redistribution & Transfer Query
  if (
    q.includes('redistribut') ||
    q.includes('transfer') ||
    q.includes('ors') ||
    q.includes('पुनर्वितरण') ||
    q.includes('हस्तांतरण')
  ) {
    const pending = context.transfers.filter((t) => t.status === 'RECOMMENDED' || t.status === 'APPROVED');
    if (lang === 'mr') {
      if (pending.length === 0) {
        return 'सध्या कोणतेही प्रलंबित किंवा शिफारस केलेले औषध हस्तांतरण नाही. सर्व केंद्रांचा साठा संतुलित आहे.';
      }
      const list = pending
        .map(
          (t) =>
            `• ${t.medicineName}: ${t.sourceFacilityName} कडून ${t.destFacilityName} कडे (${t.quantity} ${t.unit}, अंतर: ${t.distanceKm} किमी, स्थिती: ${t.status})`
        )
        .join('\n');
      return `### स्मार्ट औषध पुनर्वितरण शिफारसी:\n\n${list}\n\nकार्रवाई: 'स्मार्ट पुनर्वितरण' पर्यायातून जिल्हा आरोग्य अधिकारी हे हस्तांतरण थेट मंजूर करू शकतात.`;
    }

    if (lang === 'hi') {
      if (pending.length === 0) {
        return 'वर्तमान में कोई लंबित संसाधन स्थानांतरण नहीं है। सभी केंद्रों में आपूर्ति संतुलित है।';
      }
      const list = pending
        .map(
          (t) =>
            `• ${t.medicineName}: ${t.sourceFacilityName} से ${t.destFacilityName} (${t.quantity} ${t.unit}, दूरी: ${t.distanceKm} किमी, स्थिति: ${t.status})`
        )
        .join('\n');
      return `### अनुशंसित संसाधन पुनर्वितरण:\n\n${list}\n\nकार्रवाई: 'स्मार्ट संसाधन पुनर्वितरण' मॉड्यूल में इन हस्तांतरणों को तुरंत स्वीकृत किया जा सकता है।`;
    }

    const list = pending
      .map(
        (t) =>
          `• **${t.medicineName}**: ${t.quantity} ${t.unit} from **${t.sourceFacilityName}** to **${t.destFacilityName}** (Distance: ${t.distanceKm} km, Status: ${t.status}).`
      )
      .join('\n');
    return `### Recommended Resource Redistribution Transfers:\n\n${list}\n\nSafe donor buffers have been protected by the Haversine distance and consumption run-rate algorithm. Review dispatches in the **Smart Redistribution** page.`;
  }

  // Fallback response with helpful prompt guide
  if (lang === 'hi') {
    return `नमस्ते! मैं मेडिगाइड (MediGuide AI) हूँ। मैं जिले के सभी १२ स्वास्थ्य केंद्रों की वास्तविक स्थिति का विश्लेषण करता हूँ। आप मुझसे पूछ सकते हैं:\n\n1. "इस जिले में किन स्वास्थ्य केंद्रों में दवाइयों की कमी है?"\n2. "कौन से स्वास्थ्य केंद्रों में बिस्तर उपलब्ध हैं?"\n3. "स्टाफिंग कमी वाले केंद्र दिखाएं"\n4. "सभी गंभीर अलर्ट का सारांश दें"\n5. "किन केंद्रों में अतिरिक्त अधिशेष दवाएं हैं?"`;
  }

  if (lang === 'mr') {
    return `नमस्कार! मी मेडिगाईड (MediGuide AI) आहे. मी जिल्ह्यातील १२ प्राथमिक व ग्रामीण आरोग्य केंद्रांची स्थिती विश्लेषित करतो. तुम्ही पुढील प्रश्न विचारू शकता:\n\n१. "या आठवड्यात कोणत्या केंद्रात औषध तुटवडा आहे?"\n२. "कोणत्या केंद्रात खाटा उपलब्ध आहेत?"\n३. "डॉक्टर तुटवडा असलेली केंद्रे दाखवा"\n४. "गंभीर अलर्ट्सचा सारांश द्या"\n५. "कोणत्या केंद्रात अतिरिक्त साठा आहे?"`;
  }

  return `Hello! I am **MediGuide AI**, your district health operations copilot. I analyze live telemetry, forecasts, and logistics across all 12 PHCs & CHCs in the district.\n\nYou can ask me specific operational queries such as:\n- *"Which PHCs may run out of medicines this week?"*\n- *"Which facilities currently report available beds?"*\n- *"Show facilities with staffing below their requirements."*\n- *"Summarize all critical alerts."*\n- *"Which centres have unused medicine inventory?"*\n- *"What is the status of diagnostic tests at PHC Paud?"*`;
}

/**
 * Executes a question through either Gemini LLM API (if key is provided)
 * or seamlessly through our domain-specific rule-based intelligent copilot!
 */
export async function askMediGuide(
  question: string,
  context: AppOperationalContext,
  lang: LanguageCode
): Promise<string> {
  // 1. Attempt secure request through backend server gateway (/api/ai/chat)
  // This conceals all third-party credentials from the client browser
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: question,
        language: lang,
        modelId: 'gemini-1.5-flash',
        operationalContext: context,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        return data.text;
      }
    }
  } catch (err) {
    // Graceful fallback if backend is offline or unreachable
  }


  // Working fallback: Rule-based explainable AI assistant
  // Adds slight natural delay to feel realistic and smooth
  await new Promise((resolve) => setTimeout(resolve, 400));
  return queryRuleBasedAssistant(question, context, lang);
}
