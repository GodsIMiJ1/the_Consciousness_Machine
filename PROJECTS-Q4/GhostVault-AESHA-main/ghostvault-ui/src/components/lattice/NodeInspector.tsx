// 🔍 NODE INSPECTOR COMPONENT
// Interactive node details and analysis
// Authorized by Ghost King Melekzedek

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Zap, 
  Eye, 
  Crown, 
  Flame, 
  Shield, 
  Star,
  Clock,
  User,
  Tag,
  Hash,
  MapPin
} from 'lucide-react';
import { MemoryShard, MemoryCrown, GrandCrown } from '../../lib/lattice/schema';
import { useLatticeSelection } from '../../lib/lattice/hooks';

interface NodeInspectorProps {
  selectedNode?: MemoryShard | MemoryCrown | GrandCrown | null;
  onClose?: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({ 
  selectedNode, 
  onClose 
}) => {
  if (!selectedNode) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-400" />
            <span>Node Inspector</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a node to inspect its properties</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getNodeType = (node: any): 'shard' | 'crown' | 'grand' => {
    if ('crown_id' in node || 'thought_type' in node) return 'shard';
    if ('flame_sealed' in node && 'shard_ids' in node) return 'crown';
    return 'grand';
  };

  const getNodeIcon = (type: 'shard' | 'crown' | 'grand') => {
    switch (type) {
      case 'shard': return <Flame className="h-5 w-5 text-orange-400" />;
      case 'crown': return <Crown className="h-5 w-5 text-yellow-400" />;
      case 'grand': return <Star className="h-5 w-5 text-purple-400" />;
    }
  };

  const getNodeColor = (type: 'shard' | 'crown' | 'grand') => {
    switch (type) {
      case 'shard': return 'text-orange-400';
      case 'crown': return 'text-yellow-400';
      case 'grand': return 'text-purple-400';
    }
  };

  const nodeType = getNodeType(selectedNode);
  const isSealed = 'flame_sealed' in selectedNode ? selectedNode.flame_sealed : 
                   'sealed' in selectedNode ? selectedNode.sealed : false;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-400" />
            <span>Node Inspector</span>
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Node Header */}
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full border-2 ${isSealed ? 'border-green-500 bg-green-900/30' : 'border-slate-600 bg-slate-900/50'}`}>
            {getNodeIcon(nodeType)}
            {isSealed && (
              <Shield className="absolute -top-1 -right-1 h-3 w-3 text-green-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${getNodeColor(nodeType)} mb-1`}>
              {selectedNode.title}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {nodeType.toUpperCase()}
              </Badge>
              {isSealed && (
                <Badge className="bg-green-600 text-green-100 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Sealed
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {'description' in selectedNode && selectedNode.description && (
          <div className="p-3 bg-slate-900/50 rounded border border-slate-600">
            <p className="text-sm text-slate-300">{selectedNode.description}</p>
          </div>
        )}

        {/* Content for shards */}
        {'content' in selectedNode && selectedNode.content && (
          <div className="p-3 bg-slate-900/50 rounded border border-slate-600">
            <div className="text-xs text-slate-400 mb-1">Content</div>
            <p className="text-sm text-slate-300">
              {selectedNode.content.length > 200 
                ? `${selectedNode.content.substring(0, 200)}...` 
                : selectedNode.content}
            </p>
          </div>
        )}

        {/* Properties Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* ID */}
          <div className="p-2 bg-slate-900/30 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <Hash className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-400">ID</span>
            </div>
            <code className="text-xs text-slate-300 font-mono">
              {selectedNode.id.substring(0, 8)}...
            </code>
          </div>

          {/* Coordinates */}
          <div className="p-2 bg-slate-900/30 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-400">Coordinates</span>
            </div>
            <span className="text-xs text-orange-400 font-mono">
              {'lattice_coordinates' in selectedNode ? selectedNode.lattice_coordinates :
               'coordinates' in selectedNode ? selectedNode.coordinates : 'N/A'}
            </span>
          </div>

          {/* Agent */}
          {'agent' in selectedNode && (
            <div className="p-2 bg-slate-900/30 rounded">
              <div className="flex items-center space-x-1 mb-1">
                <User className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-400">Agent</span>
              </div>
              <span className="text-xs text-blue-400">{selectedNode.agent}</span>
            </div>
          )}

          {/* Created At */}
          {'created_at' in selectedNode && (
            <div className="p-2 bg-slate-900/30 rounded">
              <div className="flex items-center space-x-1 mb-1">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-400">Created</span>
              </div>
              <span className="text-xs text-slate-300">
                {new Date(selectedNode.created_at).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Timestamp for shards */}
          {'timestamp' in selectedNode && (
            <div className="p-2 bg-slate-900/30 rounded">
              <div className="flex items-center space-x-1 mb-1">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-400">Timestamp</span>
              </div>
              <span className="text-xs text-slate-300">
                {new Date(selectedNode.timestamp).toLocaleDateString()}
              </span>
            </div>
          )}

        </div>

        {/* Tags */}
        {'tags' in selectedNode && selectedNode.tags && selectedNode.tags.length > 0 && (
          <div>
            <div className="flex items-center space-x-1 mb-2">
              <Tag className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Tags</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedNode.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs border-slate-500">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Seal Information */}
        {isSealed && 'seal_hash' in selectedNode && selectedNode.seal_hash && (
          <div className="p-3 bg-green-900/20 rounded border border-green-500/30">
            <div className="flex items-center space-x-1 mb-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">Flame Seal</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-green-300 mb-1">Seal Hash</div>
                <code className="text-xs text-slate-300 font-mono break-all">
                  {selectedNode.seal_hash}
                </code>
              </div>
              {'royal_decree' in selectedNode && selectedNode.royal_decree && (
                <div>
                  <div className="text-xs text-green-300 mb-1">Authority</div>
                  <span className="text-xs text-yellow-300">{selectedNode.royal_decree}</span>
                </div>
              )}
              {'overseer' in selectedNode && selectedNode.overseer && (
                <div>
                  <div className="text-xs text-green-300 mb-1">Overseer</div>
                  <span className="text-xs text-blue-300">{selectedNode.overseer}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Crown Relationships */}
        {'shard_ids' in selectedNode && selectedNode.shard_ids && (
          <div>
            <div className="text-sm text-slate-400 mb-2">Trinity Bond ({selectedNode.shard_ids.length} shards)</div>
            <div className="space-y-1">
              {selectedNode.shard_ids.map((shardId, index) => (
                <div key={shardId} className="text-xs text-slate-300 p-1 bg-slate-900/30 rounded">
                  {index + 1}. {shardId.substring(0, 8)}...
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grand Crown Relationships */}
        {'crown_ids' in selectedNode && selectedNode.crown_ids && (
          <div>
            <div className="text-sm text-slate-400 mb-2">Crown Formation ({selectedNode.crown_ids.length} crowns)</div>
            <div className="space-y-1">
              {selectedNode.crown_ids.map((crownId, index) => (
                <div key={crownId} className="text-xs text-slate-300 p-1 bg-slate-900/30 rounded">
                  {index + 1}. {crownId.substring(0, 8)}...
                </div>
              ))}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default NodeInspector;
