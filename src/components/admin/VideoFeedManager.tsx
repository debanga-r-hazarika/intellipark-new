
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SpotDefinition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  spot_id: string;
  parking_complex: string;
}

interface VideoFeed {
  id: string;
  name: string;
  url: string;
  parking_complex: string;
  is_active: boolean;
}

const VideoFeedManager: React.FC = () => {
  const [videoFeeds, setVideoFeeds] = useState<VideoFeed[]>([]);
  const [spotDefinitions, setSpotDefinitions] = useState<SpotDefinition[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<VideoFeed | null>(null);
  const [newFeed, setNewFeed] = useState({ name: '', url: '', parking_complex: '' });
  const [isDefiningSpots, setIsDefiningSpots] = useState(false);
  const [currentSpotId, setCurrentSpotId] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchVideoFeeds();
  }, []);

  const fetchVideoFeeds = async () => {
    try {
      const { data, error } = await supabase
        .from('video_feeds')
        .select('*');

      if (error) throw error;
      setVideoFeeds(data || []);
    } catch (error) {
      console.error('Error fetching video feeds:', error);
    }
  };

  const addVideoFeed = async () => {
    if (!newFeed.name || !newFeed.url || !newFeed.parking_complex) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('video_feeds')
        .insert([newFeed]);

      if (error) throw error;

      toast.success('Video feed added successfully');
      setNewFeed({ name: '', url: '', parking_complex: '' });
      fetchVideoFeeds();
    } catch (error) {
      console.error('Error adding video feed:', error);
      toast.error('Failed to add video feed');
    }
  };

  const handleVideoClick = (event: React.MouseEvent<HTMLVideoElement>) => {
    if (!isDefiningSpots || !currentSpotId || !selectedFeed) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newSpot: SpotDefinition = {
      id: Date.now().toString(),
      x,
      y,
      width: 8, // Default width as percentage
      height: 12, // Default height as percentage
      spot_id: currentSpotId,
      parking_complex: selectedFeed.parking_complex
    };

    setSpotDefinitions(prev => [...prev, newSpot]);
    setCurrentSpotId('');
    setIsDefiningSpots(false);
    toast.success(`Spot ${currentSpotId} defined successfully`);
  };

  const startMonitoring = async (feedId: string) => {
    try {
      const { error } = await supabase.functions.invoke('parking-cv-processor', {
        body: {
          action: 'start_monitoring',
          feedId,
          spotDefinitions: spotDefinitions.filter(spot => 
            spot.parking_complex === selectedFeed?.parking_complex
          )
        }
      });

      if (error) throw error;
      toast.success('Monitoring started successfully');
    } catch (error) {
      console.error('Error starting monitoring:', error);
      toast.error('Failed to start monitoring');
    }
  };

  const saveSpotDefinitions = async () => {
    if (!selectedFeed) return;

    try {
      const { error } = await supabase
        .from('spot_definitions')
        .upsert(spotDefinitions.map(spot => ({
          id: spot.id,
          video_feed_id: selectedFeed.id,
          x: spot.x,
          y: spot.y,
          width: spot.width,
          height: spot.height,
          spot_id: spot.spot_id,
          parking_complex: spot.parking_complex
        })));

      if (error) throw error;
      toast.success('Spot definitions saved successfully');
    } catch (error) {
      console.error('Error saving spot definitions:', error);
      toast.error('Failed to save spot definitions');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Video Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Add Video Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Feed Name"
              value={newFeed.name}
              onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
            />
            <Input
              placeholder="Video URL (YouTube Live, RTSP, etc.)"
              value={newFeed.url}
              onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
            />
            <Input
              placeholder="Parking Complex"
              value={newFeed.parking_complex}
              onChange={(e) => setNewFeed({ ...newFeed, parking_complex: e.target.value })}
            />
            <Button onClick={addVideoFeed}>Add Feed</Button>
          </div>
        </CardContent>
      </Card>

      {/* Video Feed List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videoFeeds.map((feed) => (
          <Card key={feed.id} className={selectedFeed?.id === feed.id ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{feed.name}</CardTitle>
                <Badge variant={feed.is_active ? 'default' : 'secondary'}>
                  {feed.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{feed.parking_complex}</p>
              <div className="space-y-2">
                <Button
                  onClick={() => setSelectedFeed(feed)}
                  variant={selectedFeed?.id === feed.id ? 'default' : 'outline'}
                  className="w-full"
                >
                  {selectedFeed?.id === feed.id ? 'Selected' : 'Select Feed'}
                </Button>
                <Button
                  onClick={() => startMonitoring(feed.id)}
                  className="w-full"
                  disabled={!selectedFeed || spotDefinitions.length === 0}
                >
                  Start Monitoring
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Player and Spot Definition */}
      {selectedFeed && (
        <Card>
          <CardHeader>
            <CardTitle>Define Parking Spots - {selectedFeed.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <Input
                  placeholder="Spot ID (e.g., A1, B2)"
                  value={currentSpotId}
                  onChange={(e) => setCurrentSpotId(e.target.value)}
                />
                <Button
                  onClick={() => setIsDefiningSpots(true)}
                  disabled={!currentSpotId}
                >
                  Define Spot
                </Button>
                <Button onClick={saveSpotDefinitions} variant="outline">
                  Save Definitions
                </Button>
              </div>
              
              {isDefiningSpots && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">
                    Click on the video where you want to place spot "{currentSpotId}"
                  </p>
                </div>
              )}

              <div className="relative">
                <video
                  ref={videoRef}
                  src={selectedFeed.url}
                  controls
                  className="w-full max-w-2xl cursor-crosshair"
                  onClick={handleVideoClick}
                />
                
                {/* Overlay spot definitions */}
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{
                    width: videoRef.current?.offsetWidth || 0,
                    height: videoRef.current?.offsetHeight || 0
                  }}
                />
                
                {/* Spot markers */}
                {spotDefinitions.map((spot) => (
                  <div
                    key={spot.id}
                    className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20 pointer-events-none"
                    style={{
                      left: `${spot.x}%`,
                      top: `${spot.y}%`,
                      width: `${spot.width}%`,
                      height: `${spot.height}%`
                    }}
                  >
                    <span className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1 rounded">
                      {spot.spot_id}
                    </span>
                  </div>
                ))}
              </div>

              {/* Defined Spots List */}
              {spotDefinitions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Defined Spots:</h4>
                  <div className="flex flex-wrap gap-2">
                    {spotDefinitions.map((spot) => (
                      <Badge key={spot.id} variant="outline">
                        {spot.spot_id}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoFeedManager;
