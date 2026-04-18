"use client";

import { useState } from "react";
import { HealthLog } from "@/lib/types";

function getDiagnosisStatus(healthLogs: HealthLog[]): {
  parvoConfirmed: boolean;
  parvoDate: string | null;
  activeTreatments: HealthLog[];
  unresolvedSymptoms: HealthLog[];
} {
  const parvoLog = healthLogs.find(
    (l) => l.title.toLowerCase().includes("parvo") && l.category === "vet_visit"
  );
  const activeTreatments = healthLogs.filter(
    (l) => (l.category === "medication" || l.category === "other") && !l.resolved
  );
  const unresolvedSymptoms = healthLogs.filter(
    (l) => l.category === "symptom" && !l.resolved
  );
  return {
    parvoConfirmed: !!parvoLog,
    parvoDate: parvoLog?.date || null,
    activeTreatments,
    unresolvedSymptoms,
  };
}

export default function Resources({ healthLogs = [] }: { healthLogs?: HealthLog[] }) {
  const [openSection, setOpenSection] = useState<string | null>("status");
  const status = getDiagnosisStatus(healthLogs);

  const toggle = (id: string) => setOpenSection(openSection === id ? null : id);

  return (
    <div className="space-y-6">
      {/* Current health status */}
      <div className="card-glow bg-white rounded-2xl p-5 border border-amber-200">
        <button onClick={() => toggle("status")} className="w-full flex items-center justify-between">
          <h3 className="text-lg font-bold text-amber-900">
            {status.parvoConfirmed ? "🚨 Parvo Treatment — Active" : "🌡️ Health Status"}
          </h3>
          <span className="text-amber-500 text-xl">{openSection === "status" ? "−" : "+"}</span>
        </button>

        {openSection === "status" && (
          <div className="mt-4 space-y-4">
            {status.parvoConfirmed ? (
              <>
                <div className="p-4 bg-red-50 rounded-xl border-2 border-red-300">
                  <h4 className="font-bold text-red-800 mb-2">Parvo Positive — Diagnosed {status.parvoDate}</h4>
                  <p className="text-sm text-red-700">
                    A parvovirus diagnosis is logged. Treatment should begin immediately with a
                    veterinarian. The resources below explain what to watch for and the typical
                    recovery arc.
                  </p>
                </div>

                {status.activeTreatments.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">Active Treatment Protocol</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {status.activeTreatments.map((t) => (
                        <li key={t.id}>• <strong>{t.title}</strong> — {t.details}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h4 className="font-bold text-amber-800 mb-2">📋 Parvo Recovery — What to Watch</h4>
                  <div className="text-sm text-amber-800 space-y-2">
                    <p><strong>Critical window:</strong> First 4 days after diagnosis are the most important. The virus attacks the gut lining and immune system.</p>
                    <p><strong>Good signs (recovery):</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Keeping food down, even tiny amounts</li>
                      <li>Vomiting frequency decreasing</li>
                      <li>Any interest in food or water</li>
                      <li>Lifting head, looking around</li>
                      <li>Stool becoming less watery</li>
                      <li>Temperature stabilizing (99.5–102.5°F normal)</li>
                    </ul>
                    <p className="mt-2"><strong>Danger signs — call vet immediately:</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-red-700">
                      <li>Can&apos;t keep any food or water down</li>
                      <li>Bloody diarrhea getting worse</li>
                      <li>Becomes completely limp/unresponsive</li>
                      <li>Gums turn white or gray</li>
                      <li>Temperature drops below 99°F (hypothermia)</li>
                      <li>Seizures</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2">📅 Parvo Recovery Timeline</h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>Days 1–2:</strong> Worst symptoms — vomiting, diarrhea, very low energy. Focus is on hydration and anti-nausea meds.</p>
                    <p><strong>Days 3–4:</strong> Critical turning point. If the puppy starts keeping food down and shows interest, prognosis improves significantly.</p>
                    <p><strong>Days 5–7:</strong> If improving, appetite returns, energy slowly picks up. Still needs careful feeding protocol.</p>
                    <p><strong>Week 2:</strong> Most puppies who survive to this point make a full recovery. Gradual return to normal feeding and activity.</p>
                    <p><strong>Week 3+:</strong> Full recovery. The puppy will have natural immunity to parvo going forward.</p>
                    <p className="mt-2 font-medium">With early detection and expert care, survival rates are 85–95%.</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm text-green-800">
                  No active critical diagnoses. Check the Health tab for current status and the Vet Checklists for upcoming care.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trusted veterinary references (generic, universally useful) */}
      <div className="card-glow bg-white rounded-2xl p-5 border border-amber-200">
        <button onClick={() => toggle("references")} className="w-full flex items-center justify-between">
          <h3 className="text-lg font-bold text-amber-900">🔗 Trusted Veterinary References</h3>
          <span className="text-amber-500 text-xl">{openSection === "references" ? "−" : "+"}</span>
        </button>

        {openSection === "references" && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-amber-700">
              High-quality resources from veterinary schools and professional organizations.
              Useful whether or not you&apos;re dealing with parvo.
            </p>

            {[
              {
                title: "AVMA — Canine Parvovirus FAQ",
                url: "https://www.avma.org/resources-tools/pet-owners/petcare/canine-parvovirus",
                desc: "American Veterinary Medical Association. Symptoms, treatment, and recovery expectations.",
                tag: "Official",
              },
              {
                title: "Cornell Veterinary — Baker Institute Parvo Info",
                url: "https://www.vet.cornell.edu/departments/baker-institute/about-canine-parvovirus",
                desc: "Research-backed deep dive on the virus and treatment from Cornell's College of Veterinary Medicine.",
                tag: "University",
              },
              {
                title: "VCA Hospitals — Parvovirus in Dogs",
                url: "https://vcahospitals.com/know-your-pet/parvovirus-in-dogs",
                desc: "Covers diagnosis, treatment protocol, hospitalization, home care, and prognosis.",
                tag: "Vet Network",
              },
              {
                title: "Merck Vet Manual — Canine Parvoviral Enteritis",
                url: "https://www.merckvetmanual.com/digestive-system/diseases-of-the-stomach-and-intestines-in-small-animals/canine-parvoviral-enteritis",
                desc: "Clinical-grade reference on pathogenesis, fluid therapy, and supportive care protocols.",
                tag: "Clinical",
              },
              {
                title: "ASPCA — Animal Poison Control & Emergency",
                url: "https://www.aspca.org/pet-care/animal-poison-control",
                desc: "24/7 emergency hotline: (888) 426-4435. For emergencies when you can't reach your vet.",
                tag: "Emergency",
              },
              {
                title: "AAHA — Find an Accredited Animal Hospital",
                url: "https://www.aaha.org/your-pet/pet-owner-education/find-a-hospital/",
                desc: "Directory of AAHA-accredited vets near you. The AAHA seal is a strong quality signal.",
                tag: "Find a Vet",
              },
            ].map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-blue-900 text-sm">{link.title}</span>
                  <span className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-xs font-medium">{link.tag}</span>
                </div>
                <p className="text-xs text-blue-700">{link.desc}</p>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Auto-generated timeline from health logs */}
      <div className="card-glow bg-white rounded-2xl p-5 border border-amber-200">
        <button onClick={() => toggle("timeline")} className="w-full flex items-center justify-between">
          <h3 className="text-lg font-bold text-amber-900">📅 Health Timeline</h3>
          <span className="text-amber-500 text-xl">{openSection === "timeline" ? "−" : "+"}</span>
        </button>

        {openSection === "timeline" && (
          <div className="mt-4">
            <p className="text-sm text-amber-700 mb-3">
              Auto-generated from this dog&apos;s health records.
            </p>
            <div className="space-y-2">
              {[...healthLogs]
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((log) => (
                  <div key={log.id} className="flex gap-3 text-sm">
                    <span className="text-amber-600 font-mono shrink-0 w-20">{log.date}</span>
                    <span className={`font-medium ${log.severity === "urgent" ? "text-red-800" : "text-gray-900"}`}>
                      {log.title}
                    </span>
                    {log.resolved && <span className="text-green-600 text-xs">✓</span>}
                  </div>
                ))}
              {healthLogs.length === 0 && (
                <p className="text-sm text-amber-600 italic">No health entries yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
