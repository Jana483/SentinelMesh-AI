const toast = document.querySelector("#toast");
let toastTimer;
const chartProfiles = {
  "24h": {
    availability: [99.94, 99.96, 99.95, 99.97, 99.96, 99.98, 99.97, 99.99, 99.98, 99.99, 99.97, 99.98, 99.99, 99.98, 100, 99.98, 99.99, 100, 99.98, 99.99, 99.98],
    risk: [34, 39, 36, 42, 38, 45, 41, 48, 46, 51, 47, 54, 50, 57, 53, 61, 58, 64, 59, 66, 12],
    labels: ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM", "Now"],
  },
  "7d": {
    availability: [99.95, 99.96, 99.94, 99.97, 99.96, 99.98, 99.97, 99.98, 99.96, 99.99, 99.97, 99.98, 99.99, 99.97, 99.98, 100, 99.98, 99.99, 99.98, 99.99, 99.98],
    risk: [63, 67, 61, 70, 65, 73, 68, 74, 69, 77, 72, 81, 75, 79, 70, 65, 58, 52, 48, 38, 12],
    labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Today"],
  },
  "30d": {
    availability: [99.93, 99.95, 99.94, 99.96, 99.95, 99.98, 99.96, 99.97, 99.95, 99.99, 99.97, 99.98, 99.96, 99.99, 99.97, 99.98, 100, 99.97, 99.99, 99.98, 99.98],
    risk: [76, 80, 72, 78, 70, 83, 75, 81, 68, 76, 71, 79, 65, 73, 67, 58, 63, 49, 43, 35, 12],
    labels: ["Sep 25", "Sep 30", "Oct 5", "Oct 10", "Oct 15", "Oct 20", "Today"],
  },
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3400);
}

document.querySelector("#drill-button").addEventListener("click", (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  button.innerHTML = "<span>Running drill…</span>";
  showToast("Recovery drill started in demo mode. No live systems were affected.");
  window.setTimeout(() => {
    button.disabled = false;
    button.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v14m-7-7h14" /></svg>Run recovery drill';
  }, 1400);
});

document.querySelector("#export-button").addEventListener("click", () => {
  const report = [
    "SentinelMesh AI — Resilience Operations Report",
    "Environment: Demo (sample data; no live infrastructure connected)",
    "Service availability: 99.98%",
    "Active incidents: 2",
    "Predicted risk: Low",
    "Automated actions today: 14",
  ].join("\n");
  const file = new Blob([report], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "sentinelmesh-resilience-report.txt";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Demo report exported.");
});

function renderChart(range) {
  const profile = chartProfiles[range];
  const toPoints = (values, yForValue) => values.map((value, index) => {
    const x = (index / (values.length - 1)) * 700;
    return [x, yForValue(value)];
  });
  const toPath = (points) => points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const availability = toPoints(profile.availability, (value) => 38 - ((value - 99.9) / 0.1) * 32);
  const risk = toPoints(profile.risk, (value) => 176 - value * 1.45);
  const availabilityPath = toPath(availability);
  document.querySelector("#chart-availability").setAttribute("d", availabilityPath);
  document.querySelector("#chart-area").setAttribute("d", `${availabilityPath}V190H0Z`);
  document.querySelector("#chart-risk").setAttribute("d", toPath(risk));
  document.querySelector("#availability-end").setAttribute("cy", availability.at(-1)[1].toFixed(1));
  document.querySelector("#risk-end").setAttribute("cy", risk.at(-1)[1].toFixed(1));
  document.querySelector("#tooltip-availability").textContent = `${profile.availability.at(-1).toFixed(2)}%`;
  document.querySelector("#tooltip-risk").textContent = `${profile.risk.at(-1)} risk`;
  document.querySelectorAll(".x-axis span").forEach((label, index) => {
    label.textContent = profile.labels[index];
  });
}

const timeRange = document.querySelector("#time-range");
renderChart(timeRange.value);
timeRange.addEventListener("change", (event) => {
  const label = event.currentTarget.selectedOptions[0].textContent.toLowerCase();
  renderChart(event.currentTarget.value);
  showToast(`Showing sample resilience trends for ${label}.`);
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelector(".nav-link.active")?.classList.remove("active");
    link.classList.add("active");
  });
});
export const RESILIENCE_PLAYBOOKS = [
  {
    id: "pb-regional-failover",
    name: "Regional service failover",
    category: "Continuity",
    triggerCondition: "API latency > 250ms for 3 consecutive minutes",
    triggeredCountThisMonth: 3,
    status: "Active",
    approvalRequired: true,
    steps: [
      "Verify health of standby endpoint (Continuity Mail / Backup Relay)",
      "Shift 25% canary traffic to standby region and monitor error rate",
      "Execute full DNS/routing cutover upon operator approval",
      "Notify #ops-resilience channel with post-failover telemetry"
    ]
  },
  {
    id: "pb-access-isolation",
    name: "Suspicious access isolation",
    category: "Security",
    triggerCondition: "Impossible travel or anomalous OAuth token scope elevation",
    triggeredCountThisMonth: 1,
    status: "Active",
    approvalRequired: true,
    steps: [
      "Snapshot active session metadata and IP reputation score",
      "Revoke refresh tokens for flagged session without terminating healthy endpoints",
      "Enforce step-up hardware MFA challenge on next login",
      "Generate incident ticket with Security Investigation Agent summary"
    ]
  },
  {
    id: "pb-messaging-fallback",
    name: "Cross-platform chat continuity bridge",
    category: "Communication Mesh",
    triggerCondition: "Primary chat provider (Teams/Slack) HTTP 5xx rate > 5%",
    triggeredCountThisMonth: 0,
    status: "Active",
    approvalRequired: true,
    steps: [
      "Activate federated Matrix / Mattermost emergency bridge rooms",
      "Sync critical incident response channels and on-call roster",
      "Broadcast fallback workspace link via SMS and backup email relay",
      "Queue missed messages for replay once primary service recovers"
    ]
  },
  {
    id: "pb-storage-quota-rebalance",
    name: "Storage threshold auto-tiering",
    category: "Capacity",
    triggerCondition: "Regional storage utilization > 85% (e.g., EU-West)",
    triggeredCountThisMonth: 2,
    status: "Active",
    approvalRequired: false,
    steps: [
      "Identify cold archives untouched for > 180 days",
      "Compress and migrate cold blobs to secondary archive tier",
      "Re-verify regional write throughput and free capacity headroom"
    ]
  },
  {
    id: "pb-llm-degradation",
    name: "AI triage model fallback",
    category: "AI Operations",
    triggerCondition: "Gemini 2.5 Pro timeout > 10s or quota throttling",
    triggeredCountThisMonth: 0,
    status: "Standby",
    approvalRequired: false,
    steps: [
      "Route incoming log triage to Gemini 2.5 Flash low-latency pipeline",
      "Switch root-cause context window to compressed summary embeddings",
      "Restore primary reasoning model once p95 latency drops below 2s"
    ]
  }
];
