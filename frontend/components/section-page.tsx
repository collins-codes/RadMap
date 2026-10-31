import Sidebar from "@/components/sidebar";
import type { LucideIcon } from "lucide-react";

type SectionPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
};

export default function SectionPage({
  title,
  description,
  icon: Icon,
  features
}: SectionPageProps) {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <p className="subtitle">{description}</p>
          </div>
          <div className="status">
            <span>●</span> SYSTEM ONLINE
          </div>
        </header>

        <section className="panel" style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                background: "rgba(57, 224, 208, 0.1)",
                color: "#39e0d0",
                padding: 12,
                borderRadius: 12
              }}
            >
              <Icon size={25} />
            </div>
            <div>
              <h2>{title}</h2>
              <p className="panel-description">{description}</p>
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <h2>Platform capabilities</h2>
            <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
              {features.map((feature, index) => (
                <div
                  key={feature}
                  className="reading"
                  style={{ justifyContent: "flex-start", gap: 14 }}
                >
                  <span style={{ color: "#39e0d0" }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <p
            style={{
              color: "#8492a8",
              fontSize: 12,
              marginTop: 28,
              lineHeight: 1.6
            }}
          >
            This section is currently a frontend preview. Live data and
            backend functionality will be connected during integration.
          </p>
        </section>
      </main>
    </div>
  );
}
