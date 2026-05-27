import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, Clock, User, Wifi, WifiOff, RefreshCw, Loader2 } from "lucide-react";
import { useQueueSubscription } from "@/hooks/useQueueSubscription";

interface WaitListBoardProps {
  onSort?: (field: string) => void;
  onSearch?: (query: string) => void;
}

const WaitListBoard = ({
  onSort = () => {},
  onSearch = () => {},
}: WaitListBoardProps) => {
  const {
    queue,
    stats,
    connectionStatus,
    usingFallback,
    loading,
    error,
    refresh,
    retryWebSocket,
  } = useQueueSubscription({
    pollingInterval: 10000, // 10 seconds fallback
    debug: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "ascending" | "descending";
  }>({
    key: "createdAt",
    direction: "ascending",
  });

  // Transform queue entries to display format
  const displayCustomers = useMemo(() => {
    return queue.map(entry => ({
      id: entry.id.toString(),
      name: entry.customer?.name || 'Unknown',
      status: entry.status === 'IN_PROGRESS' ? 'in-store' as const : 'online' as const,
      estimatedWaitTime: entry.estimatedWaitTime || 0,
      checkInTime: new Date(entry.checkInTime),
      service: entry.service?.name || 'Not specified',
      type: 'walk-in' as const,
      queueStatus: entry.status,
      position: entry.priority || 0,
    }));
  }, [queue]);

  // Filter by search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return displayCustomers;
    const query = searchQuery.toLowerCase();
    return displayCustomers.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.service?.toLowerCase().includes(query)
    );
  }, [displayCustomers, searchQuery]);

  // Sort customers
  const sortedCustomers = useMemo(() => {
    if (!sortConfig.key) return filteredCustomers;
    
    return [...filteredCustomers].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];
      
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [filteredCustomers, sortConfig]);

  const handleSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    onSort(key);
  };

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getStatusBadge = (status: "online" | "in-store") => {
    return status === "online" ? (
      <Badge variant="secondary" className="bg-dynamic-primary/10 text-dynamic-primary">
        Waiting
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-dynamic-accent/10 text-dynamic-accent">
        In Progress
      </Badge>
    );
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            Live
          </Badge>
        );
      case 'connecting':
      case 'reconnecting':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Connecting
          </Badge>
        );
      case 'fallback':
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Polling
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 flex items-center gap-1">
            <WifiOff className="h-3 w-3" />
            Offline
          </Badge>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800">Current Wait List</h2>
          {getConnectionStatusBadge()}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
          <Button onClick={refresh} variant="outline" size="icon" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {usingFallback && (
            <Button onClick={retryWebSocket} variant="outline" size="sm">
              <Wifi className="h-4 w-4 mr-1" />
              Retry Live
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && sortedCustomers.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-dynamic-primary" />
          <span className="ml-2 text-gray-500">Loading queue...</span>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableCaption>
              Current wait list as of {new Date().toLocaleTimeString()}
              {usingFallback && ' (updates every 10s)'}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Service</TableHead>
                <TableHead>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("estimatedWaitTime")}
                  >
                    Wait Time
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("checkInTime")}
                  >
                    Check-in Time
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCustomers.length > 0 ? (
                sortedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {customer.service}
                    </TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell>
                      {formatTime(customer.estimatedWaitTime)}
                    </TableCell>
                    <TableCell>
                      {customer.checkInTime.toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-gray-500"
                  >
                    No customers in the wait list
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>Total customers waiting: {stats?.totalWaiting ?? sortedCustomers.length}</p>
        {(stats?.averageWaitTime || sortedCustomers.length > 0) && (
          <p>
            Average wait time:{" "}
            {formatTime(
              stats?.averageWaitTime || 
              Math.round(
                sortedCustomers.reduce(
                  (sum, customer) => sum + customer.estimatedWaitTime,
                  0,
                ) / Math.max(sortedCustomers.length, 1),
              ),
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default WaitListBoard;
