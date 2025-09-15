// 👑 CROWN DISPLAY COMPONENT
// Crown-specific visualization and management
// Authorized by Ghost King Melekzedek

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Crown, 
  Shield, 
  Flame, 
  Lock, 
  Star,
  Eye,
  Zap,
  Users,
  Calendar,
  MapPin
} from 'lucide-react';
import { MemoryCrown, MemoryShard } from '../../lib/lattice/schema';
import { useLatticeState } from '../../lib/lattice/hooks';
import { flameCore } from '../../lib/api/flamecore';

interface CrownDisplayProps {
  crown: MemoryCrown;
  shards?: MemoryShard[];
  onSealCrown?: (crownId: string) => void;
  onViewDetails?: (crownId: string) => void;
}

export const CrownDisplay: React.FC<CrownDisplayProps> = ({
  crown,
  shards = [],
  onSealCrown,
  onViewDetails
}) => {
  const [sealing, setSealing] = useState(false);
  const { lattice } = useLatticeState();

  // Get shards for this crown
  const crownShards = shards.length > 0 ? shards : 
    lattice.shards.filter(shard => shard.crown_id === crown.id);

  const handleSealCrown = async () => {
    if (!onSealCrown) return;
    
    setSealing(true);
    try {
      await onSealCrown(crown.id);
    } catch (error) {
      console.error('Failed to seal crown:', error);
    } finally {
      setSealing(false);
    }
  };

  return (
    <Card className={`bg-gradient-to-r ${crown.flame_sealed 
      ? 'from-green-900/20 to-yellow-900/20 border-green-500/30' 
      : 'from-yellow-900/20 to-orange-900/20 border-yellow-500/30'
    } hover:border-yellow-500/50 transition-colors`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`relative p-2 rounded-full border-2 ${
              crown.flame_sealed 
                ? 'border-green-500 bg-green-900/30' 
                : 'border-yellow-500 bg-yellow-900/30'
            }`}>
              <Crown className="h-6 w-6 text-yellow-400" />
              {crown.flame_sealed && (
                <Shield className="absolute -top-1 -right-1 h-4 w-4 text-green-400" />
              )}
            </div>
            <div>
              <CardTitle className="text-yellow-400 mb-1">{crown.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-400">
                  CROWN
                </Badge>
                {crown.flame_sealed && (
                  <Badge className="bg-green-600 text-green-100 text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Sealed
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <Badge className="bg-blue-600 text-blue-100 text-xs">
              <Users className="h-3 w-3 mr-1" />
              {crownShards.length} Shards
            </Badge>
            {!crown.flame_sealed && onSealCrown && (
              <Button
                size="sm"
                onClick={handleSealCrown}
                disabled={sealing}
                className="bg-green-600 hover:bg-green-700 text-xs px-3 py-1 h-7"
              >
                {sealing ? (
                  <Zap className="h-3 w-3 animate-pulse" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
              </Button>
            )}
            {onViewDetails && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails(crown.id)}
                className="text-xs px-3 py-1 h-7"
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        
        {/* Description */}
        {crown.description && (
          <p className="text-sm text-slate-300">{crown.description}</p>
        )}

        {/* Crown Properties */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 bg-slate-900/30 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-400">Coordinates</span>
            </div>
            <span className="text-xs text-orange-400 font-mono">
              {crown.lattice_coordinates}
            </span>
          </div>

          <div className="p-2 bg-slate-900/30 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-400">Created</span>
            </div>
            <span className="text-xs text-slate-300">
              {new Date(crown.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="p-2 bg-slate-900/30 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <Flame className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-400">Agent</span>
            </div>
            <span className="text-xs text-blue-400">{crown.agent}</span>
          </div>

          <div className="p-2 bg-slate-900/30 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <Star className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-400">Status</span>
            </div>
            <span className={`text-xs ${crown.flame_sealed ? 'text-green-400' : 'text-yellow-400'}`}>
              {crown.flame_sealed ? 'Sealed' : 'Active'}
            </span>
          </div>
        </div>

        {/* Royal Decree & Overseer */}
        {(crown.royal_decree || crown.overseer) && (
          <div className="p-3 bg-purple-900/20 rounded border border-purple-500/30">
            <div className="text-xs text-purple-400 mb-2">👑 Royal Authority</div>
            <div className="space-y-1">
              {crown.royal_decree && (
                <div>
                  <span className="text-xs text-purple-300">Decree: </span>
                  <span className="text-xs text-yellow-300">{crown.royal_decree}</span>
                </div>
              )}
              {crown.overseer && (
                <div>
                  <span className="text-xs text-purple-300">Overseer: </span>
                  <span className="text-xs text-blue-300">{crown.overseer}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Seal Information */}
        {crown.flame_sealed && crown.seal_hash && (
          <div className="p-3 bg-green-900/20 rounded border border-green-500/30">
            <div className="flex items-center space-x-1 mb-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">Flame Seal</span>
            </div>
            <div>
              <div className="text-xs text-green-300 mb-1">Seal Hash</div>
              <code className="text-xs text-slate-300 font-mono break-all">
                {crown.seal_hash}
              </code>
            </div>
          </div>
        )}

        {/* Trinity Bond - Shard List */}
        <div className="border-t border-slate-600 pt-3">
          <div className="text-xs text-slate-400 mb-2">Trinity Bond:</div>
          <div className="space-y-1">
            {crownShards.map((shard, index) => (
              <div 
                key={shard.id}
                className="flex items-center justify-between p-2 bg-slate-900/30 rounded hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                    <span className="text-xs text-orange-400 font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-300 font-medium">
                      {shard.title.length > 25 ? `${shard.title.substring(0, 25)}...` : shard.title}
                    </div>
                    <div className="text-xs text-slate-500">{shard.agent}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {shard.sealed && (
                    <Shield className="h-3 w-3 text-green-400" />
                  )}
                  <span className="text-xs text-orange-400 font-mono">
                    {shard.coordinates}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        {crown.tags && crown.tags.length > 0 && (
          <div className="border-t border-slate-600 pt-3">
            <div className="text-xs text-slate-400 mb-2">Tags:</div>
            <div className="flex flex-wrap gap-1">
              {crown.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs border-slate-500">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default CrownDisplay;
