
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type VideoFeed = Database['public']['Tables']['video_feeds']['Row'];
type SpotDefinition = Database['public']['Tables']['spot_definitions']['Row'];

interface SpotDefinitionInput {
  x: number;
  y: number;
  width: number;
  height: number;
  spot_id: string;
  parking_complex: string;
  video_feed_id: string;
}

const VideoFeedManager: React.FC = () => {
  const [videoFeeds, setVideoFeeds] = useState<VideoFeed[]>([]);
  const [spotDefinitions, setSpotDefinitions] = useState<SpotDefinitionInput[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<VideoFeed | null>(null);
  const [newFeed, setNewFeed] = useState({ name: '', url: '', parking_complex: '' });
  const [isDefiningSpots, setIsDefiningSpots] = useState(false);
  const [currentSpotId, setCurrentSpotId] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchVideoFeeds();
  }, []);

  useEffect(() => {
    if (selectedFeed) {
      fetchSpotDefinitions(selectedFeed.id);
    }
  }, [selectedFeed]);

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

  const fetchSpotDefinitions = async (videoFeedId: string) => {
    try {
      const { data, error } = await supabase
        .from('spot_definitions')
        .select('*')
        .eq('video_feed_id', videoFeedId);

      if (error) throw error;
      
      const mappedSpots = (data || []).map(spot => ({
        x: Number(spot.x),
        y: Number(spot.y),
        width: Number(spot.width),
        height: Number(spot.height),
        spot_id: spot.spot_id,
        parking_complex: spot.parking_complex,
        video_feed_id: spot.video_feed_id || videoFeedId
      }));
      
      setSpotDefinitions(mappedSpots);
    } catch (error) {
      console.error('Error fetching spot definitions:', error);
    }
  };

  const addVideoFeed = async () => {
    if (!newFeed.name || !newFeed.url || !newFeed.parking_complex) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // First, create parking spots for this complex if they don't exist
      await createParkingSpotsForComplex(newFeed.parking_complex);

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

  const createParkingSpotsForComplex = async (parkingComplex: string) => {
    try {
      // Check if parking spots already exist for this complex
      const { data: existingSpots } = await supabase
        .from('parking_spots')
        .select('*')
        .eq('parking_complex', parkingComplex);

      if (existingSpots && existingSpots.length > 0) {
        return; // Spots already exist
      }

      // Create some default parking spots (A1-A10, B1-B10)
      const spots = [];
      for (let row of ['A', 'B']) {
        for (let i = 1; i <= 10; i++) {
          spots.push({
            spot_id: `${row}${i}`,
            parking_complex: parkingComplex,
            status: 'available'
          });
        }
      }

      const { error } = await supabase
        .from('parking_spots')
        .insert(spots);

      if (error) throw error;
      toast.success(`Created ${spots.length} parking spots for ${parkingComplex}`);
    } catch (error) {
      console.error('Error creating parking spots:', error);
      toast.error('Failed to create parking spots');
    }
  };

  const convertToEmbedUrl = (url: string) => {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const handleVideoClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDefiningSpots || !currentSpotId || !selectedFeed) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newSpot: SpotDefinitionInput = {
      x,
      y,
      width: 8, // Default width as percentage
      height: 12, // Default height as percentage
      spot_id: currentSpotId,
      parking_complex: selectedFeed.parking_complex,
      video_feed_id: selectedFeed.id
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
    if (!selectedFeed || spotDefinitions.length === 0) {
      toast.error('No spot definitions to save');
      return;
    }

    try {
      // Delete existing definitions for this video feed
      await supabase
        .from('spot_definitions')
        .delete()
        .eq('video_feed_id', selectedFeed.id);

      // Insert new definitions
      const definitionsToInsert = spotDefinitions.map(spot => ({
        video_feed_id: selectedFeed.id,
        x: spot.x,
        y: spot.y,
        width: spot.width,
        height: spot.height,
        spot_id: spot.spot_id,
        parking_complex: spot.parking_complex
      }));

      const { error } = await supabase
        .from('spot_definitions')
        .insert(definitionsToInsert);

      if (error) throw error;
      toast.success('Spot definitions saved successfully');
    } catch (error) {
      console.error('Error saving spot definitions:', error);
      toast.error('Failed to save spot definitions');
    }
  };

  const removeSpotDefinition = (index: number) => {
    setSpotDefinitions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Add New Video Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Add Video Feed & Create Parking Complex</CardTitle>
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
              placeholder="Parking Complex Name"
              value={newFeed.parking_complex}
              onChange={(e) => setNewFeed({ ...newFeed, parking_complex: e.target.value })}
            />
            <Button onClick={addVideoFeed}>Add Feed & Create Complex</Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            This will create a new parking complex with default spots (A1-A10, B1-B10) and add the video feed.
          </p>
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
                  Save Definitions ({spotDefinitions.length})
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
                {isYouTubeUrl(selectedFeed.url) ? (
                  <div 
                    className={`relative w-full max-w-2xl ${isDefiningSpots ? 'cursor-crosshair' : ''}`}
                    onClick={handleVideoClick}
                  >
                    <iframe
                      ref={iframeRef}
                      src={convertToEmbedUrl(selectedFeed.url)}
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    
                    {/* Overlay for click detection */}
                    {isDefiningSpots && (
                      <div className="absolute inset-0 bg-transparent z-10" />
                    )}
                  </div>
                ) : (
                  <div 
                    className={`relative ${isDefiningSpots ? 'cursor-crosshair' : ''}`}
                    onClick={handleVideoClick}
                  >
                    <video
                      ref={videoRef}
                      src={selectedFeed.url}
                      controls
                      className="w-full max-w-2xl"
                    />
                  </div>
                )}
                
                {/* Spot markers */}
                {spotDefinitions.map((spot, index) => (
                  <div
                    key={index}
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
                  <h4 className="font-medium mb-2">Defined Spots ({spotDefinitions.length}):</h4>
                  <div className="flex flex-wrap gap-2">
                    {spotDefinitions.map((spot, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Badge variant="outline">{spot.spot_id}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSpotDefinition(index)}
                          className="text-red-500 hover:text-red-700 p-1 h-6 w-6"
                        >
                          ×
                        </Button>
                      </div>
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
