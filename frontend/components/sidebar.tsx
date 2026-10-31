"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Activity,
  AlertTriangle,
  Zap,
  BarChart3,
  Database,
  Settings,
  ShieldCheck
} from "lucide-react";

const navigation = [
  {
    title: "WORKSPACE",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Monitoring Map", href: "/map", icon: Map },
      { label: "Readings", href: "/readings", icon: Activity },
      { label: "Anomalies", href: "/anomalies", icon: AlertTriangle }
    ]
  },
  {
    title: "INTELLIGENCE",
    items: [
      { label: "RadMap Sentinel", href: "/sentinel", icon: Zap },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Evidence Records", href: "/evidence", icon: Database }
    ]
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Data Integrity", href: "/integrity", icon: ShieldCheck }
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
        RAD<span>MAP</span>
      </Link>

      {navigation.map((group) => (
        <div key={group.title}>
          <div className="nav-label">{group.title}</div>

          {group.items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${active ? "active" : ""}`}
                style={{ textDecoration: "none" }}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
