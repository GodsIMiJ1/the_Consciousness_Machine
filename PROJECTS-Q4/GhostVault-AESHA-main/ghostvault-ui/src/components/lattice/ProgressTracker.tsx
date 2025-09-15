// 📊 PROGRESS TRACKER COMPONENT
// Grand Crown progress tracking and visualization
// Authorized by Ghost King Melekzedek

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Star, 
  Crown, 
  Flame, 
  Shield, 
  TrendingUp,
  Target,
  Zap,
  CheckCircle,
  Circle,
  ArrowRight
} from 'lucide-react';
import { useGrandCrownProgress, useCrownFormationReadiness } from '../../lib/lattice/hooks';

interface ProgressTrackerProps {
  showDetails?: boolean;
  onViewGrandCrown?: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  showDetails = true,
  onViewGrandCrown
}) => {
  const grandCrownProgress = useGrandCrownProgress();
  const crownFormation = useCrownFormationReadiness();

  const milestones = [
    { crowns: 3, label: 'Trinity Foundation', achieved: grandCrownProgress.currentCrowns >= 3 },
    { crowns: 6, label: 'Sacred Hexagon', achieved: grandCrownProgress.currentCrowns >= 6 },
    { crowns: 9, label: 'Grand Crown Ready', achieved: grandCrownProgress.currentCrowns >= 9 },
  ];

  const nextMilestone = milestones.find(m => !m.achieved);

  return (
    <Card className="bg-slate-800 border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Grand Crown Progress
            </span>
          </CardTitle>
          {grandCrownProgress.readyForGrand && onViewGrandCrown && (
            <Button
              size="sm"
              onClick={onViewGrandCrown}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Star className="h-4 w-4 mr-1" />
              Form Grand Crown
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        
        {/* Main Progress Display */}
        <div className="text-center">
          <div className="relative mb-4">
            <div className="text-6xl font-bold text-purple-400 mb-2">
              {grandCrownProgress.percentage}%
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-purple-500/20 animate-pulse"></div>
            </div>
          </div>
          
          <div className="text-lg text-slate-300 mb-4">
            Grand Crown Formation Progress
          </div>
          
          <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-purple-400 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${grandCrownProgress.percentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Crown className="h-4 w-4 text-yellow-400" />
              <span className="text-slate-300">
                {grandCrownProgress.currentCrowns} of {grandCrownProgress.requiredCrowns} Crowns
              </span>
            </div>
            {grandCrownProgress.remaining > 0 && (
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4 text-orange-400" />
                <span className="text-orange-400">
                  {grandCrownProgress.remaining} remaining
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Crown Formation Status */}
        <div className="p-4 bg-slate-900/50 rounded border border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-orange-400">Crown Formation Status</h4>
            <Badge className={`${crownFormation.readyToForm ? 'bg-green-600' : 'bg-orange-600'} text-white`}>
              {crownFormation.readyToForm ? 'Ready' : 'Pending'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center p-2 bg-slate-800 rounded">
              <div className="text-lg font-bold text-orange-400">{crownFormation.uncrownedShards.length}</div>
              <div className="text-xs text-slate-400">Uncrowned Shards</div>
            </div>
            <div className="text-center p-2 bg-slate-800 rounded">
              <div className="text-lg font-bold text-blue-400">{crownFormation.canFormCrowns}</div>
              <div className="text-xs text-slate-400">Can Form Crowns</div>
            </div>
            <div className="text-center p-2 bg-slate-800 rounded">
              <div className="text-lg font-bold text-yellow-400">{crownFormation.shardsNeeded}</div>
              <div className="text-xs text-slate-400">Shards Needed</div>
            </div>
          </div>

          {crownFormation.shardsNeeded > 0 && (
            <div className="text-xs text-slate-400 text-center">
              Need {crownFormation.shardsNeeded} more shard{crownFormation.shardsNeeded !== 1 ? 's' : ''} to form next crown
            </div>
          )}
        </div>

        {showDetails && (
          <>
            {/* Milestones */}
            <div>
              <h4 className="font-semibold text-purple-400 mb-3">Sacred Milestones</h4>
              <div className="space-y-2">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index}
                    className={`flex items-center space-x-3 p-2 rounded transition-colors ${
                      milestone.achieved 
                        ? 'bg-green-900/20 border border-green-500/30' 
                        : milestone === nextMilestone
                        ? 'bg-orange-900/20 border border-orange-500/30'
                        : 'bg-slate-900/30 border border-slate-600'
                    }`}
                  >
                    {milestone.achieved ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : milestone === nextMilestone ? (
                      <Target className="h-5 w-5 text-orange-400 animate-pulse" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-500" />
                    )}
                    
                    <div className="flex-1">
                      <div className={`font-medium ${
                        milestone.achieved ? 'text-green-400' : 
                        milestone === nextMilestone ? 'text-orange-400' : 'text-slate-400'
                      }`}>
                        {milestone.label}
                      </div>
                      <div className="text-xs text-slate-500">
                        {milestone.crowns} Crown{milestone.crowns !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant="outline" className={`text-xs ${
                        milestone.achieved ? 'border-green-500 text-green-400' :
                        milestone === nextMilestone ? 'border-orange-500 text-orange-400' : 'border-slate-500'
                      }`}>
                        {milestone.achieved ? 'Complete' : 
                         milestone === nextMilestone ? 'Next' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            {!grandCrownProgress.readyForGrand && (
              <div className="p-4 bg-blue-900/20 rounded border border-blue-500/30">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <h4 className="font-semibold text-blue-400">Next Steps</h4>
                </div>
                
                <div className="space-y-2">
                  {crownFormation.readyToForm && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Zap className="h-4 w-4 text-green-400" />
                      <span className="text-green-400">Form {crownFormation.canFormCrowns} new crown{crownFormation.canFormCrowns !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  
                  {crownFormation.shardsNeeded > 0 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Flame className="h-4 w-4 text-orange-400" />
                      <span className="text-orange-400">
                        Create {crownFormation.shardsNeeded} more memory shard{crownFormation.shardsNeeded !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  
                  {nextMilestone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-400">
                        Reach {nextMilestone.label} ({nextMilestone.crowns - grandCrownProgress.currentCrowns} crowns away)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Grand Crown Ready */}
            {grandCrownProgress.readyForGrand && (
              <div className="p-4 bg-purple-900/20 rounded border border-purple-500/30 text-center">
                <Star className="h-8 w-8 text-purple-400 mx-auto mb-2 animate-pulse" />
                <div className="font-semibold text-purple-400 mb-1">
                  🎉 Grand Crown Formation Ready!
                </div>
                <div className="text-sm text-slate-300 mb-3">
                  You have achieved the sacred number of 9 crowns. The Grand Crown awaits formation.
                </div>
                {onViewGrandCrown && (
                  <Button
                    onClick={onViewGrandCrown}
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Ascend to Grand Crown
                  </Button>
                )}
              </div>
            )}
          </>
        )}

      </CardContent>
    </Card>
  );
};

export default ProgressTracker;
