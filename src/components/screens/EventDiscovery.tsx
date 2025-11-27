import { useState, useEffect, useContext } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { OrganizationCard } from "../common/OrganizationCard";
import { StudentCard } from "../common/StudentCard";
import { Badge } from "../ui/badge";
import { Search, Grid3X3, List } from "lucide-react";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { SkeletonOrganizationCard, SkeletonStudentCard } from "../common/SkeletonCard";
import APIContext from "../../Context/apimethods/APIContext";
import { organizationurl, userinfo } from "../../Context/API/ApiRouter";

interface EventDiscoveryProps {
  onNavigate?: (screen: string, data?: any) => void;
}

export function EventDiscovery({ onNavigate }: EventDiscoveryProps) {
  const { GETFunction, POSTFunction, PUTFunction } = useContext(APIContext);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "organizations" | "students">("all");
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const categories = ["all", "Academic", "Sports", "Arts", "Greek Life", "Service", "Cultural"];
  const types = ["all", "organizations", "students"];

  // Fetch organizations and students from backend
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch organizations
      const orgsResponse = await GETFunction(organizationurl);
      if (orgsResponse?.success && orgsResponse?.data) {
        setOrganizations(orgsResponse.data);
      }

      // Fetch students - using userinfo endpoint with query params for students
      const studentsResponse = await GETFunction(userinfo, { type: "students" });
      if (studentsResponse?.success && studentsResponse?.data) {
        setStudents(studentsResponse.data);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load discovery data");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || org.category === selectedCategory;
    const matchesType = selectedType === "all" || selectedType === "organizations";
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.interests.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || 
                           (selectedCategory === "Academic" && (student.major.toLowerCase().includes("computer") || student.major.toLowerCase().includes("engineering") || student.major.toLowerCase().includes("science"))) ||
                           (selectedCategory === "Sports" && student.interests.some(interest => interest.toLowerCase().includes("basketball") || interest.toLowerCase().includes("sports"))) ||
                           (selectedCategory === "Arts" && (student.major.toLowerCase().includes("art") || student.interests.some(interest => interest.toLowerCase().includes("art") || interest.toLowerCase().includes("design")))) ||
                           (selectedCategory === "Greek Life" && student.interests.some(interest => interest.toLowerCase().includes("greek"))) ||
                           (selectedCategory === "Service" && student.interests.some(interest => interest.toLowerCase().includes("service") || interest.toLowerCase().includes("community"))) ||
                           (selectedCategory === "Cultural" && student.interests.some(interest => interest.toLowerCase().includes("cultural") || interest.toLowerCase().includes("exchange")));
    const matchesType = selectedType === "all" || selectedType === "students";
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const allFiltered = [...filteredOrganizations, ...filteredStudents];

  const handleJoinOrganization = async (orgId: string) => {
    try {
      // Optimistically update UI
      setOrganizations(prev => prev.map(org =>
        org.id === orgId
          ? { ...org, isJoined: !org.isJoined }
          : org
      ));

      // Make API call to join/leave organization
      await POSTFunction({ organizationId: orgId }, `${organizationurl}${orgId}/join`);
    } catch (err) {
      console.error("Error joining organization:", err);
      // Revert optimistic update on error
      setOrganizations(prev => prev.map(org =>
        org.id === orgId
          ? { ...org, isJoined: !org.isJoined }
          : org
      ));
    }
  };

  const handleFollowStudent = async (studentId: string) => {
    try {
      // Optimistically update UI
      setStudents(prev => prev.map(student =>
        student.id === studentId
          ? { ...student, isFollowing: !student.isFollowing }
          : student
      ));

      // Make API call to follow/unfollow student
      await POSTFunction({ userId: studentId }, `${userinfo}/${studentId}/follow`);
    } catch (err) {
      console.error("Error following student:", err);
      // Revert optimistic update on error
      setStudents(prev => prev.map(student =>
        student.id === studentId
          ? { ...student, isFollowing: !student.isFollowing }
          : student
      ));
    }
  };

  const handleNavigateToOrganization = (orgId: string) => {
    onNavigate?.("organizationProfile", { organizationId: orgId });
  };

  const handleNavigateToStudent = (studentId: string) => {
    onNavigate?.("otherUserProfile", { userId: studentId });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Campus Community</h1>
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
              placeholder="Search organizations and students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {types.map((type) => (
              <Badge
                key={type}
                variant={selectedType === type ? "default" : "secondary"}
                className={`cursor-pointer whitespace-nowrap ${
                  selectedType === type ? "bg-primary text-primary-foreground" : ""
                }`}
                onClick={() => setSelectedType(type as "all" | "organizations" | "students")}
              >
                {type === "all" ? "All" : type === "organizations" ? "Organizations" : "Students"}
              </Badge>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                className={`cursor-pointer whitespace-nowrap ${
                  selectedCategory === category ? "bg-primary text-primary-foreground" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "All Categories" : category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-md mx-auto p-4">
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-destructive">
            <p className="font-medium">Error loading discovery data</p>
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
        {isLoading ? (
          <div className="space-y-4">
            <SkeletonOrganizationCard />
            <SkeletonOrganizationCard />
            <SkeletonOrganizationCard />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {allFiltered.length} results found
                {selectedType === "organizations" && ` (${filteredOrganizations.length} organizations)`}
                {selectedType === "students" && ` (${filteredStudents.length} students)`}
                {selectedType === "all" && ` (${filteredOrganizations.length} organizations, ${filteredStudents.length} students)`}
              </p>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrganizations.map((org) => (
                  <OrganizationCard
                    key={org.id}
                    organization={org}
                    onJoin={handleJoinOrganization}
                    variant="grid"
                    onNavigate={handleNavigateToOrganization}
                  />
                ))}
                {filteredStudents.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onFollow={handleFollowStudent}
                    variant="grid"
                    onNavigate={handleNavigateToStudent}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrganizations.map((org) => (
                  <OrganizationCard
                    key={org.id}
                    organization={org}
                    onJoin={handleJoinOrganization}
                    variant="list"
                    onNavigate={handleNavigateToOrganization}
                  />
                ))}
                {filteredStudents.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onFollow={handleFollowStudent}
                    variant="list"
                    onNavigate={handleNavigateToStudent}
                  />
                ))}
              </div>
            )}

            {allFiltered.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}