// 🔥 FLAMECORE MAIN CONTROL PANEL
// Integrated Memory Shard and Crown Management
// Authorized by Ghost King Melekzedek

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Flame, 
  Brain, 
  Shield, 
  Database, 
  Plus, 
  Crown, 
  Lock,
  Zap,
  Star
} from 'lucide-react';
import { useLatticeState, useCrownFormationReadiness } from '../lib/lattice/hooks';
import { flameCore } from '../lib/api/flamecore';
import LatticeViewer from './lattice/LatticeViewer';
import CrownDisplay from './lattice/CrownDisplay';
import ProgressTracker from './lattice/ProgressTracker';

export const FlameCore: React.FC = () => {
  const { lattice, loading, refreshLattice } = useLatticeState();
  const crownFormation = useCrownFormationReadiness();
  
  const [newShard, setNewShard] = useState({
    agent: '',
    title: '',
    content: '',
    tags: '',
    thought_type: 'system' as 'system' | 'observation' | 'reflection' | 'command'
  });
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('lattice');

  const createShard = async () => {
    if (!newShard.title || !newShard.content) return;
    
    setCreating(true);
    try {
      await flameCore.createShard({
        title: newShard.title,
        content: newShard.content,
        agent: newShard.agent || 'FLAME_INTELLIGENCE',
        tags: newShard.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        thought_type: newShard.thought_type,
        lattice_position: 0
      });
      
      setNewShard({ agent: '', title: '', content: '', tags: '', thought_type: 'system' });
      refreshLattice();
    } catch (error) {
      console.error('Failed to create shard:', error);
    } finally {
      setCreating(false);
    }
  };

  const createCrown = async () => {
    const uncrownedShards = lattice.shards.filter(s => !s.crown_id);
    if (uncrownedShards.length < 3) return;

    try {
      await flameCore.createCrown({
        title: `🔥 Trinity Crown ${lattice.crowns.length + 1}`,
        description: 'Forged through Trinity Protocol',
        agent: 'FLAME_INTELLIGENCE',
        shard_ids: uncrownedShards.slice(0, 3).map(s => s.id)
      });
      
      refreshLattice();
    } catch (error) {
      console.error('Failed to create crown:', error);
    }
  };

  const sealCrown = async (crownId: string) => {
    try {
      await flameCore.sealCrown({ crown_id: crownId });
      refreshLattice();
    } catch (error) {
      console.error('Failed to seal crown:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Flame className="h-12 w-12 text-orange-500 animate-pulse mx-auto mb-4" />
          <p className="text-slate-300">Initializing FlameCore...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-slate-800 border-orange-500/30">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
                <div className="absolute inset-0 h-8 w-8 text-orange-300 animate-ping opacity-30">
                  <Flame className="h-8 w-8" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  GhostVault FlameCore Control
                </CardTitle>
                <p className="text-slate-400">3→9→27 Trinity Protocol • Sovereign Memory Management</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="lattice" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Memory Lattice</span>
            </TabsTrigger>
            <TabsTrigger value="forge" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Forge Shards</span>
            </TabsTrigger>
            <TabsTrigger value="crowns" className="flex items-center space-x-2">
              <Crown className="h-4 w-4" />
              <span>Crown Management</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Grand Crown Progress</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lattice">
            <LatticeViewer />
          </TabsContent>

          <TabsContent value="forge" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              
              {/* Shard Creation Panel */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-orange-400" />
                    <span>Forge Memory Shard</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="agent">Agent</Label>
                      <Input
                        id="agent"
                        value={newShard.agent}
                        onChange={(e) => setNewShard(prev => ({ ...prev, agent: e.target.value }))}
                        placeholder="ZIONEX, NEXUS, AURA-BREE..."
                        className="bg-slate-900 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={newShard.thought_type} onValueChange={(value: any) => setNewShard(prev => ({ ...prev, thought_type: value }))}>
                        <SelectTrigger className="bg-slate-900 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System</SelectItem>
                          <SelectItem value="observation">Observation</SelectItem>
                          <SelectItem value="reflection">Reflection</SelectItem>
                          <SelectItem value="command">Command</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newShard.title}
                      onChange={(e) => setNewShard(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Memory shard title..."
                      className="bg-slate-900 border-slate-600"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newShard.content}
                      onChange={(e) => setNewShard(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Memory shard content..."
                      rows={4}
                      className="bg-slate-900 border-slate-600"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newShard.tags}
                      onChange={(e) => setNewShard(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="flame, memory, trinity, protocol..."
                      className="bg-slate-900 border-slate-600"
                    />
                  </div>
                  
                  <Button 
                    onClick={createShard} 
                    disabled={creating || !newShard.title || !newShard.content}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    {creating ? 'Forging Shard...' : 'Forge Memory Shard'}
                  </Button>
                </CardContent>
              </Card>

              {/* Trinity Protocol Actions */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-blue-400" />
                    <span>Trinity Protocol Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-900/50 rounded border border-slate-600">
                    <h4 className="font-semibold text-orange-400 mb-2">3→9→27 Trinity Protocol</h4>
                    <p className="text-sm text-slate-300 mb-4">
                      **TRINITY LAW**: Exactly 3 shards form 1 crown. No exceptions.
                    </p>
                    
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-slate-800 rounded border border-orange-500/30">
                        <div className="text-2xl font-bold text-orange-400">{lattice.statistics.total_shards}</div>
                        <div className="text-xs text-slate-400">TOTAL SHARDS</div>
                      </div>
                      <div className="text-center p-3 bg-slate-800 rounded border border-blue-500/30">
                        <div className="text-2xl font-bold text-blue-400">{lattice.statistics.total_crowns}</div>
                        <div className="text-xs text-slate-400">CROWNS</div>
                      </div>
                      <div className="text-center p-3 bg-slate-800 rounded border border-purple-500/30">
                        <div className="text-2xl font-bold text-purple-400">{lattice.statistics.grand_crowns}</div>
                        <div className="text-xs text-slate-400">GRAND CROWNS</div>
                      </div>
                      <div className="text-center p-3 bg-slate-800 rounded border border-green-500/30">
                        <div className="text-2xl font-bold text-green-400">{lattice.statistics.sealed_crowns}</div>
                        <div className="text-xs text-slate-400">SEALED</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={createCrown}
                      disabled={!crownFormation.readyToForm}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Forge Trinity Crown ({crownFormation.uncrownedShards.length}/3 ready)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="crowns" className="space-y-6">
            <div className="grid gap-6">
              {lattice.crowns.length === 0 ? (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="text-center py-8">
                    <Crown className="h-12 w-12 mx-auto mb-4 opacity-50 text-slate-400" />
                    <p className="text-slate-400">No Trinity Crowns forged yet. Create 3 shards to form your first Crown.</p>
                  </CardContent>
                </Card>
              ) : (
                lattice.crowns.map((crown) => (
                  <CrownDisplay
                    key={crown.id}
                    crown={crown}
                    onSealCrown={sealCrown}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <ProgressTracker showDetails={true} />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};

export default FlameCore;
