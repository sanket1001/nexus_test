import { useState, useEffect, useContext } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { EventCard } from "../common/EventCard";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Search, Grid3X3, List, Calendar, MapPin, Filter, Check, CheckCheck } from "lucide-react";
import { SkeletonEventCard } from "../common/SkeletonCard";
import APIContext from "../../Context/apimethods/APIContext";
import { eventurl } from "../../Context/API/ApiRouter";

interface EventsScreenProps {
  onNavigate?: (screen: string, data?: any) => void;
}

export function EventsScreen({ onNavigate }: EventsScreenProps) {
  const { GETFunction, POSTFunction, PUTFunction } = useContext(APIContext);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showGoingOnly, setShowGoingOnly] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const categories = ["all", "Academic", "Sports", "Arts", "Greek Life", "Service", "Cultural"];
  const dateFilters = ["all", "today", "tomorrow", "this-week", "this-month"];
  const locations = ["all", "Library", "Recreation Center", "Student Union", "Campus Quad", "Engineering Building", "Convention Center", "Campus Amphitheater", "Wellness Center"];

  // Fetch events from backend
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const eventsResponse = await GETFunction(eventurl);
      if (eventsResponse?.success && eventsResponse?.data) {
        setEvents(eventsResponse.data);
      }
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(err.message || "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper function to check if event matches date filter
  const matchesDateFilter = (event: any) => {
    if (selectedDate === "all") return true;
    
    const eventDate = event.date.toLowerCase();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    switch (selectedDate) {
      case "today":
        return eventDate.includes("dec 18") || eventDate.includes("today");
      case "tomorrow":
        return eventDate.includes("dec 19") || eventDate.includes("tomorrow");
      case "this-week":
        return eventDate.includes("dec") && (
          eventDate.includes("18") || eventDate.includes("19") || eventDate.includes("20") || 
          eventDate.includes("21") || eventDate.includes("22") || eventDate.includes("23") || eventDate.includes("24")
        );
      case "this-month":
        return eventDate.includes("dec") || eventDate.includes("jan") || eventDate.includes("feb") || 
               eventDate.includes("mar") || eventDate.includes("apr") || eventDate.includes("may");
      default:
        return true;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = 
      selectedCategory === "all" ? true :
      event.category === selectedCategory;
    const matchesDate = matchesDateFilter(event);
    const matchesLocation = selectedLocation === "all" || event.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesGoing = !showGoingOnly || event.isRSVPd;
    
    return matchesSearch && matchesCategory && matchesDate && matchesLocation && matchesGoing;
  });

  const handleBookmark = async (eventId: string) => {
    try {
      // Optimistically update UI
      setEvents(prev => prev.map(event =>
        event.id === eventId
          ? { ...event, isBookmarked: !event.isBookmarked }
          : event
      ));

      // Make API call to update bookmark
      await PUTFunction({ eventId }, `${eventurl}${eventId}/bookmark`);
    } catch (err) {
      console.error("Error updating bookmark:", err);
      // Revert optimistic update on error
      setEvents(prev => prev.map(event =>
        event.id === eventId
          ? { ...event, isBookmarked: !event.isBookmarked }
          : event
      ));
    }
  };

  const handleRSVP = async (eventId: string) => {
    try {
      // Optimistically update UI
      setEvents(prev => prev.map(event =>
        event.id === eventId
          ? { ...event, isRSVPd: !event.isRSVPd }
          : event
      ));

      // Make API call to update RSVP
      await PUTFunction({ eventId }, `${eventurl}${eventId}/rsvp`);
    } catch (err) {
      console.error("Error updating RSVP:", err);
      // Revert optimistic update on error
      setEvents(prev => prev.map(event =>
        event.id === eventId
          ? { ...event, isRSVPd: !event.isRSVPd }
          : event
      ));
    }
  };

  const handleOrganizerClick = (organizerName: string) => {
    // Navigate to organization profile
    // We'll use the existing profile system but pass the organization name
    if (onNavigate) {
      onNavigate('organizationProfile', { organizationName: organizerName });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Campus Events</h1>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events, organizers, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Categories</span>
              </div>
              {/* Going Filter Toggle */}
              <Button
                variant={showGoingOnly ? "default" : "outline"}
                size="sm"
                className={`h-8 gap-2 ${
                  showGoingOnly ? "bg-primary text-primary-foreground" : ""
                }`}
                onClick={() => setShowGoingOnly(!showGoingOnly)}
              >
                <CheckCheck className="w-4 h-4" aria-hidden="true" />
                <span>Going</span>
              </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "secondary"}
                  className={`cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategory === category ? "bg-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all" ? "All Events" : category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Date and Location Filter Dropdowns */}
          <div className="grid grid-cols-2 gap-3">
            {/* Date Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Date</span>
              </div>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Location</span>
              </div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Library">Library</SelectItem>
                  <SelectItem value="Recreation Center">Recreation Center</SelectItem>
                  <SelectItem value="Student Union">Student Union</SelectItem>
                  <SelectItem value="Campus Quad">Campus Quad</SelectItem>
                  <SelectItem value="Engineering Building">Engineering Building</SelectItem>
                  <SelectItem value="Convention Center">Convention Center</SelectItem>
                  <SelectItem value="Campus Amphitheater">Campus Amphitheater</SelectItem>
                  <SelectItem value="Wellness Center">Wellness Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-md mx-auto p-4">
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-destructive">
            <p className="font-medium">Error loading events</p>
            <p className="text-sm mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={fetchData}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredEvents.length} events found
            </p>
            {(selectedCategory !== "all" || selectedDate !== "all" || selectedLocation !== "all" || showGoingOnly) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedDate("all");
                  setSelectedLocation("all");
                  setShowGoingOnly(false);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonEventCard key={index} />
            ))}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onBookmark={handleBookmark}
                onRSVP={handleRSVP}
                onOrganizerClick={handleOrganizerClick}
                variant="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onBookmark={handleBookmark}
                onRSVP={handleRSVP}
                onOrganizerClick={handleOrganizerClick}
                variant="list"
              />
            ))}
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No events found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}