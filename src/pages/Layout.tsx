import { type ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FolderKanban, FileText, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Resume", href: "/resume", icon: FileText },
  { name: "Projects", href: "/projects", icon: FolderKanban },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.toLowerCase().startsWith(href);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TW</span>
              </div>
              <span className="font-semibold text-slate-900 text-lg">Thomas Wilson</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 py-4">
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="relative flex-1">{children}</main>

      <footer className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">TW</span>
              </div>
              <span className="text-slate-600 font-medium">Thomas Wilson</span>
            </div>
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
