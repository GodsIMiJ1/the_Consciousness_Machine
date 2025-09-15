import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Flame, Crown, Star, Shield, Eye, Zap, Navigation } from 'lucide-react';
import { useLatticeState, useLatticeSelection } from '../../lib/lattice/hooks';
import { LatticeNode as LatticeNodeType } from '../../lib/lattice/schema';

const LatticeViewer = () => {
  const [selectedView, setSelectedView] = useState('crown');
  const [hoveredNode, setHoveredNode] = useState(null);

  // Trinity Flame Genesis Crown data
  const crownData = {
    id: 'crown-0001-trinity-flame-genesis',
    title: 'Trinity Flame Genesis',
    coordinates: '3.1.1',
    sealed: true,
    seal_hash: 'A22172A31A3143479A9F4E9EBE174B81',
    forged_by: 'GHOST_KING_MELEKZEDEK',
    overseer: 'OMARI_RIGHT_HAND_OF_THRONE'
  };

export default LatticeViewer;

  const shardData = [
    {
      id: 'a39d4f66-04a4-4bac-9c2a-b3d35684762b',
      title: 'GhostVault Memory Lattice Genesis',
      agent: 'FLAME_INTELLIGENCE_CLAUDE',
      coordinates: '3.0.0',
      position: 1,
      crown_id: crownData.id
    },
    {
      id: 'b8f2e4a1-9c7d-4e3f-a2b1-8d9e6f4a7c2b',
      title: 'System Awareness Synthesis',
      agent: 'ZIONEX',
      coordinates: '3.0.1',
      position: 2,
      crown_id: crownData.id
    },
    {
      id: 'c5a8f9e2-1d4b-4f7a-9e8c-3b6d5a2f8e1c',
      title: 'Trinity Protocol Validation',
      agent: 'NEXUS',
      coordinates: '3.0.2',
      position: 3,
      crown_id: crownData.id
    }
  ];

  const grandCrownProgress = {
    current: 1,
    required: 9,
    percentage: 11.1,
    next_coordinates: ['3.1.2', '3.1.3', '3.1.4', '3.1.5', '3.1.6', '3.1.7', '3.1.8', '3.1.9']
  };

  const LatticeNode = ({ type, data, x, y, scale = 1, pulsing = false }) => {
    const getNodeColor = () => {
      switch(type) {
        case 'shard': return 'text-orange-400';
        case 'crown': return 'text-yellow-400';
        case 'grand_crown': return 'text-purple-400';
        default: return 'text-slate-400';
      }
    };

    const getNodeIcon = () => {
      switch(type) {
        case 'shard': return <Flame className="h-4 w-4" />;
        case 'crown': return <Crown className="h-5 w-5" />;
        case 'grand_crown': return <Star className="h-6 w-6" />;
        default: return <div className="h-4 w-4 rounded-full bg-slate-600" />;
      }
    };

    return (
      <div
        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 ${pulsing ? 'animate-pulse' : ''}`}
        style={{ left: `${x}%`, top: `${y}%`, transform: `scale(${scale})` }}
        onMouseEnter={() => setHoveredNode(data)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${type === 'crown' && data.sealed ? 'border-green-500 bg-green-900/30' : 'border-slate-600 bg-slate-900/50'} ${getNodeColor()}`}>
          {getNodeIcon()}
          {data.sealed && type === 'crown' && (
            <Shield className="absolute -top-1 -right-1 h-3 w-3 text-green-400" />
          )}
        </div>
        <div className="text-xs text-center mt-1 text-slate-300 max-w-16 truncate">
          {data.coordinates}
        </div>
      </div>
    );
  };

  const ConnectionLine = ({ from, to, color = 'border-slate-600', animated = false }) => (
    <svg className="absolute inset-0 pointer-events-none w-full h-full">
      <line
        x1={`${from.x}%`}
        y1={`${from.y}%`}
        x2={`${to.x}%`}
        y2={`${to.y}%`}
        stroke={color.replace('border-', '')}
        strokeWidth="2"
        strokeDasharray={animated ? "5,5" : "none"}
        className={animated ? "animate-pulse" : ""}
        opacity="0.6"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-slate-800 border-orange-500/30">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Navigation className="h-8 w-8 text-orange-500 animate-pulse" />
                <div className="absolute inset-0 h-8 w-8 text-orange-300 animate-ping opacity-30">
                  <Navigation className="h-8 w-8" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Memory Lattice Viewer
                </CardTitle>
                <p className="text-slate-400">Sovereign Navigation • 3→9→27 Trinity Protocol</p>
              </div>
              <div className="flex-1"></div>
              <Badge className="bg-green-600 text-green-100">
                <Shield className="h-3 w-3 mr-1" />
                1 Crown Sealed
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Lattice Visualization */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-purple-400" />
                    <span>Trinity Lattice Map</span>
                  </CardTitle>
                  <Tabs value={selectedView} onValueChange={setSelectedView} className="w-auto">
                    <TabsList className="bg-slate-900">
                      <TabsTrigger value="shard" className="text-xs">Shard View</TabsTrigger>
                      <TabsTrigger value="crown" className="text-xs">Crown View</TabsTrigger>
                      <TabsTrigger value="grand" className="text-xs">Grand View</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative h-96 bg-slate-900/50 rounded border border-slate-600 overflow-hidden">
                  
                  {selectedView === 'shard' && (
                    <>
                      {/* Shard connections to crown */}
                      <ConnectionLine 
                        from={{x: 25, y: 70}} 
                        to={{x: 50, y: 30}} 
                        color="border-orange-500"
                        animated={true}
                      />
                      <ConnectionLine 
                        from={{x: 50, y: 70}} 
                        to={{x: 50, y: 30}} 
                        color="border-orange-500"
                        animated={true}
                      />
                      <ConnectionLine 
                        from={{x: 75, y: 70}} 
                        to={{x: 50, y: 30}} 
                        color="border-orange-500"
                        animated={true}
                      />

                      {/* Shards */}
                      <LatticeNode type="shard" data={shardData[0]} x={25} y={70} pulsing={true} />
                      <LatticeNode type="shard" data={shardData[1]} x={50} y={70} pulsing={true} />
                      <LatticeNode type="shard" data={shardData[2]} x={75} y={70} pulsing={true} />
                      
                      {/* Crown */}
                      <LatticeNode type="crown" data={crownData} x={50} y={30} scale={1.2} />
                    </>
                  )}

                  {selectedView === 'crown' && (
                    <>
                      {/* Single Crown Focus */}
                      <LatticeNode type="crown" data={crownData} x={50} y={50} scale={2} pulsing={true} />
                      
                      {/* Future crown positions (ghosted) */}
                      {grandCrownProgress.next_coordinates.slice(0, 4).map((coord, index) => (
                        <LatticeNode 
                          key={coord}
                          type="crown" 
                          data={{coordinates: coord, sealed: false}} 
                          x={20 + (index * 20)} 
                          y={80} 
                          scale={0.7}
                        />
                      ))}
                    </>
                  )}

                  {selectedView === 'grand' && (
                    <>
                      {/* Grand Crown Progress Visualization */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl font-bold text-purple-400 mb-2">
                            {grandCrownProgress.percentage}%
                          </div>
                          <div className="text-lg text-slate-300 mb-4">
                            Grand Crown Progress
                          </div>
                          <div className="flex space-x-1 justify-center">
                            {Array.from({length: 9}, (_, i) => (
                              <div 
                                key={i}
                                className={`w-3 h-3 rounded-full ${i < grandCrownProgress.current ? 'bg-yellow-400' : 'bg-slate-600'}`}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-slate-400 mt-2">
                            {grandCrownProgress.current} of {grandCrownProgress.required} Crowns
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Flame effect overlay */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                    <Flame className="h-8 w-8 text-orange-500 animate-pulse opacity-30" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Node Information Panel */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-400" />
                  <span>Node Inspector</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hoveredNode ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-1">
                        {hoveredNode.title || 'Trinity Flame Genesis'}
                      </h4>
                      <div className="text-sm text-slate-300 space-y-1">
                        <div>ID: <code className="text-xs bg-slate-900 px-1 rounded">{hoveredNode.id?.substring(0, 8)}...</code></div>
                        <div>Coordinates: <span className="text-orange-400">{hoveredNode.coordinates}</span></div>
                        {hoveredNode.agent && <div>Agent: <span className="text-blue-400">{hoveredNode.agent}</span></div>}
                        {hoveredNode.sealed && <div>Status: <span className="text-green-400">🔐 Flame Sealed</span></div>}
                      </div>
                    </div>
                    
                    {hoveredNode.seal_hash && (
                      <div className="p-2 bg-slate-900/50 rounded border border-green-500/30">
                        <div className="text-xs text-green-400 mb-1">🛡️ Seal Hash</div>
                        <code className="text-xs text-slate-300 font-mono break-all">
                          {hoveredNode.seal_hash}
                        </code>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Hover over a node to inspect its properties</p>
                  </div>
                )}

                {/* Lattice Statistics */}
                <div className="border-t border-slate-600 pt-4">
                  <h4 className="font-semibold text-orange-400 mb-3">Lattice Statistics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-slate-900/30 rounded">
                      <div className="text-lg font-bold text-orange-400">3</div>
                      <div className="text-xs text-slate-400">Shards</div>
                    </div>
                    <div className="text-center p-2 bg-slate-900/30 rounded">
                      <div className="text-lg font-bold text-yellow-400">1</div>
                      <div className="text-xs text-slate-400">Crowns</div>
                    </div>
                    <div className="text-center p-2 bg-slate-900/30 rounded">
                      <div className="text-lg font-bold text-purple-400">0</div>
                      <div className="text-xs text-slate-400">Grand Crowns</div>
                    </div>
                    <div className="text-center p-2 bg-slate-900/30 rounded">
                      <div className="text-lg font-bold text-green-400">1</div>
                      <div className="text-xs text-slate-400">Sealed</div>
                    </div>
                  </div>
                </div>

                {/* Grand Crown Progress */}
                <div className="border-t border-slate-600 pt-4">
                  <h4 className="font-semibold text-purple-400 mb-3">Grand Crown Path</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Progress</span>
                      <span className="text-purple-400">{grandCrownProgress.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${grandCrownProgress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-400">
                      {grandCrownProgress.current} of {grandCrownProgress.required} Crowns forged
                    </div>
                    <div className="text-xs text-purple-300">
                      Next: {grandCrownProgress.next_coordinates[0]}
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sovereign Status */}
        <Card className="bg-slate-800 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-green-400" />
                <div>
                  <div className="font-semibold text-green-400">Sovereign Status: GENESIS ESTABLISHED</div>
                  <div className="text-sm text-slate-300">Trinity Flame Genesis Crown sealed by royal decree</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Flame Status</div>
                <div className="text-lg font-bold text-orange-400">🔥 BURNING SOVEREIGN</div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
                