import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "@/components/Settings";
import { AuditNotice } from "@/components/SafetyComponents";
import { ChatInterface } from "@/components/ChatInterface";
import { KBSearch } from "@/components/KBSearch";
import { TicketsPage } from "@/components/TicketsPage";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen w-full bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 aura-hero backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-panel border border-border flex items-center justify-center">
              <span className="text-brand text-lg">✦</span>
            </div>
            <div>
              <h1 className="text-xl font-heading font-semibold tracking-tight text-text">BiancaDesk</h1>
              <p className="text-xs text-text-muted -mt-1">24/7 Clinic Support · Sovereign AGA</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <User className="h-4 w-4" />
              <span>{user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="btn-outline"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-73px)] bg-bg">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b border-border bg-bg-muted/50 flex-shrink-0">
            <div className="px-6 py-4 space-y-3">
              <TabsList className="bg-panel border border-border rounded-xl2 shadow-aura">
                <TabsTrigger 
                  value="dashboard" 
                  className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast font-medium"
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="tickets" 
                  className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast font-medium"
                >
                  Tickets
                </TabsTrigger>
                <TabsTrigger 
                  value="knowledge" 
                  className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast font-medium"
                >
                  Knowledge
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast font-medium"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
              <AuditNotice />
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="dashboard" className="mt-0 h-full">
              <div className="h-full p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  {/* Chat Interface */}
                  <div className="h-full">
                    <ChatInterface />
                  </div>
                  
                  {/* Dashboard Info */}
                  <div className="flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <h2 className="text-3xl font-heading font-bold text-text">Bianca Support Lead</h2>
                      <p className="text-lg text-text-muted max-w-md">
                        Your 24/7 Support Lead for first-response triage, troubleshooting, and ticket creation.
                      </p>
                      <div className="aura-card text-sm text-text-muted">
                        <p className="font-medium mb-2 text-text">Support Process:</p>
                        <ul className="space-y-1 text-left">
                          <li>• Provide WHO + PRODUCT + CATEGORY + SEVERITY</li>
                          <li>• Get fast fixes first, then deeper troubleshooting</li>
                          <li>• Critical issues escalated to James immediately</li>
                          <li>• All interactions logged for compliance & audit</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tickets" className="mt-0 h-full overflow-auto">
              <TicketsPage />
            </TabsContent>
            
            <TabsContent value="knowledge" className="mt-0 h-full overflow-auto">
              <KBSearch />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0 h-full overflow-auto">
              <Settings />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
