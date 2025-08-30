import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Phone, Heart, Timer, Wind, Plus, Trash2 } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface SafetyKitProps {
  onCallEmergency: () => void;
}

export default function SafetyKit({ onCallEmergency }: SafetyKitProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  const [breathingTimer, setBreathingTimer] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathePhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  // Breathing exercise timer
  useEffect(() => {
    if (!isBreathing) return;
    
    const interval = setInterval(() => {
      setBreathingTimer(prev => {
        const newTime = prev + 1;
        
        // 4-4-6 breathing pattern (16 seconds total)
        if (newTime <= 4) setBreathePhase('inhale');
        else if (newTime <= 8) setBreathePhase('hold');
        else if (newTime <= 14) setBreathePhase('exhale');
        else {
          // Reset cycle
          setBreathePhase('inhale');
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathing]);

  const addContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) return;
    
    const contact: Contact = {
      id: Date.now().toString(),
      name: newContact.name.trim(),
      phone: newContact.phone.trim()
    };
    
    setContacts(prev => [...prev, contact]);
    setNewContact({ name: "", phone: "" });
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathingTimer(0);
    setBreathePhase('inhale');
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    setBreathingTimer(0);
  };

  const getBreathingInstruction = () => {
    switch (breathPhase) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe Out...';
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Actions */}
      <Card className="p-6 bg-gradient-surface border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Emergency Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={onCallEmergency}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground p-4 h-auto"
          >
            <Phone className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">Emergency Call</div>
              <div className="text-sm opacity-90">911 / Crisis Line</div>
            </div>
          </Button>
          
          <Button
            onClick={startBreathing}
            variant="outline"
            className="p-4 h-auto border-primary/20 hover:bg-primary/10"
          >
            <Wind className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">Breathing Exercise</div>
              <div className="text-sm opacity-90">4-4-6 Pattern</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Breathing Coach */}
      {isBreathing && (
        <Card className="p-6 bg-gradient-surface border-border text-center">
          <div className="space-y-4">
            <div className={`
              w-24 h-24 mx-auto rounded-full border-4 border-primary
              flex items-center justify-center transition-all duration-1000
              ${breathPhase === 'inhale' ? 'scale-110 bg-primary/20' : 
                breathPhase === 'hold' ? 'scale-105 bg-primary/30' : 
                'scale-95 bg-primary/10'}
            `}>
              <Heart className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h4 className="text-xl font-semibold text-foreground">
                {getBreathingInstruction()}
              </h4>
              <p className="text-muted-foreground">
                {breathingTimer <= 4 ? `${4 - breathingTimer}s` :
                 breathingTimer <= 8 ? `${8 - breathingTimer}s` :
                 `${14 - breathingTimer}s`}
              </p>
            </div>
            
            <Button onClick={stopBreathing} variant="outline" size="sm">
              <Timer className="w-4 h-4 mr-2" />
              Stop Exercise
            </Button>
          </div>
        </Card>
      )}

      {/* ICE Contacts */}
      <Card className="p-6 bg-gradient-surface border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          In Case of Emergency Contacts
        </h3>
        
        {/* Add new contact */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              placeholder="Name"
              value={newContact.name}
              onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Phone number"
              value={newContact.phone}
              onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
            />
            <Button onClick={addContact} size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Contact list */}
        <div className="space-y-2">
          {contacts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No emergency contacts added yet
            </p>
          ) : (
            contacts.map(contact => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.phone}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => window.open(`tel:${contact.phone}`)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeContact(contact.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}