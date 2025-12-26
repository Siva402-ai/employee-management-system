"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, X, CalendarIcon, Users, Building2, UserCheck, UserX } from "lucide-react"

interface SearchFilterProps {
  onSearchResults: (results: any[]) => void
  searchType: "employees" | "attendance" | "leaves"
}

interface FilterState {
  departments: string[]
  positions: string[]
  attendanceStatus: string[]
  leaveStatus: string[]
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  salaryRange: {
    min: number
    max: number
  }
}

export function SearchFilterSystem({ onSearchResults, searchType }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    departments: [],
    positions: [],
    attendanceStatus: [],
    leaveStatus: [],
    dateRange: { from: undefined, to: undefined },
    salaryRange: { min: 0, max: 200000 },
  })

  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterOptions, setFilterOptions] = useState({
    departments: [] as string[],
    positions: [] as string[],
    attendanceStatus: ["Present", "Absent", "Late", "Early Exit"],
    leaveStatus: ["pending", "approved", "rejected"],
  })

  // Fetch departments and positions from backend once
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [deptRes, empRes] = await Promise.all([fetch('/api/departments'), fetch('/api/employees')])
        const [depts, emps] = await Promise.all([deptRes.ok ? deptRes.json() : [], empRes.ok ? empRes.json() : []])
        const departments = Array.isArray(depts) ? depts.map((d: any) => d.name || d.department || d.title).filter(Boolean) : []
        // Extract unique positions from employees
        const positions = Array.isArray(emps) ? Array.from(new Set(emps.map((e: any) => e.position).filter(Boolean))) : []
        setFilterOptions((prev) => ({ ...prev, departments, positions }))
      } catch (err) {
        console.warn('Failed to load filter options', err)
      }
    }

    loadOptions()
  }, [])

  useEffect(() => {
    if (searchTerm.length > 0 || hasActiveFilters()) {
      performSearch()
    } else {
      setSearchResults([])
      onSearchResults([])
    }
  }, [searchTerm, activeFilters])

  const hasActiveFilters = () => {
    return (
      activeFilters.departments.length > 0 ||
      activeFilters.positions.length > 0 ||
      activeFilters.attendanceStatus.length > 0 ||
      activeFilters.leaveStatus.length > 0 ||
      activeFilters.dateRange.from ||
      activeFilters.dateRange.to ||
      activeFilters.salaryRange.min > 0 ||
      activeFilters.salaryRange.max < 200000
    )
  }

  const performSearch = async () => {
    setIsLoading(true)
    try {
      let results: any[] = []

      if (searchType === 'employees') {
        const res = await fetch('/api/employees')
        const emps = res.ok ? await res.json() : []
        results = (emps as any[]).filter((emp) => {
          const matchesSearch = !searchTerm || [emp.name, emp.employeeId, emp.department, emp.position, emp.email]
            .filter(Boolean)
            .some((v: string) => v.toLowerCase().includes(searchTerm.toLowerCase()))

          const matchesDepartment = activeFilters.departments.length === 0 || activeFilters.departments.includes(emp.department)
          const matchesPosition = activeFilters.positions.length === 0 || activeFilters.positions.includes(emp.position)
          const salary = Number(emp.salary || 0)
          const matchesSalary = salary >= activeFilters.salaryRange.min && salary <= activeFilters.salaryRange.max

          return matchesSearch && matchesDepartment && matchesPosition && matchesSalary
        })
      } else if (searchType === 'attendance') {
        const res = await fetch('/api/attendance')
        const atts = res.ok ? await res.json() : []
        results = (atts as any[]).filter((att) => {
          const matchesSearch = !searchTerm || [att.employeeName, att.employeeId, att.department, att.date, att.status]
            .filter(Boolean)
            .some((v: string) => v.toLowerCase().includes(searchTerm.toLowerCase()))

          const matchesDepartment = activeFilters.departments.length === 0 || activeFilters.departments.includes(att.department)
          const matchesStatus = activeFilters.attendanceStatus.length === 0 || activeFilters.attendanceStatus.includes(att.status)

          return matchesSearch && matchesDepartment && matchesStatus
        })
      } else if (searchType === 'leaves') {
        const url = new URL('/api/leaves', location.origin)
        if (activeFilters.leaveStatus.length) {
          // server supports status query param? we'll fetch all and filter client-side to be safe
        }
        const res = await fetch('/api/leaves')
        const leaves = res.ok ? await res.json() : []
        results = (leaves as any[]).filter((leave) => {
          const matchesSearch = !searchTerm || [leave.employeeName, leave.employeeId, leave.leaveType]
            .filter(Boolean)
            .some((v: string) => v.toLowerCase().includes(searchTerm.toLowerCase()))

          const matchesStatus = activeFilters.leaveStatus.length === 0 || activeFilters.leaveStatus.includes(leave.status)

          return matchesSearch && matchesStatus
        })
      }

      setSearchResults(results)
      onSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const updateFilter = (filterType: keyof FilterState, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const toggleArrayFilter = (
    filterType: "departments" | "positions" | "attendanceStatus" | "leaveStatus",
    value: string,
  ) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value],
    }))
  }

  const clearAllFilters = () => {
    setActiveFilters({
      departments: [],
      positions: [],
      attendanceStatus: [],
      leaveStatus: [],
      dateRange: { from: undefined, to: undefined },
      salaryRange: { min: 0, max: 200000 },
    })
    setSearchTerm("")
  }

  const getActiveFilterCount = () => {
    let count = 0
    count += activeFilters.departments.length
    count += activeFilters.positions.length
    count += activeFilters.attendanceStatus.length
    count += activeFilters.leaveStatus.length
    if (activeFilters.dateRange.from || activeFilters.dateRange.to) count++
    if (activeFilters.salaryRange.min > 0 || activeFilters.salaryRange.max < 200000) count++
    return count
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Header */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={`Search ${searchType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-teal-500">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                </div>

                {/* Department Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <div className="space-y-2">
                    {filterOptions.departments.map((dept) => (
                      <div key={dept} className="flex items-center space-x-2">
                        <Checkbox
                          id={dept}
                          checked={activeFilters.departments.includes(dept)}
                          onCheckedChange={() => toggleArrayFilter("departments", dept)}
                        />
                        <label htmlFor={dept} className="text-sm">
                          {dept}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Position Filter (for employees) */}
                {searchType === "employees" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Position</label>
                    <div className="space-y-2">
                      {filterOptions.positions.map((position) => (
                        <div key={position} className="flex items-center space-x-2">
                          <Checkbox
                            id={position}
                            checked={activeFilters.positions.includes(position)}
                            onCheckedChange={() => toggleArrayFilter("positions", position)}
                          />
                          <label htmlFor={position} className="text-sm">
                            {position}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attendance Status Filter */}
                {searchType === "attendance" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Attendance Status</label>
                    <div className="space-y-2">
                      {filterOptions.attendanceStatus.map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={status}
                            checked={activeFilters.attendanceStatus.includes(status)}
                            onCheckedChange={() => toggleArrayFilter("attendanceStatus", status)}
                          />
                          <label htmlFor={status} className="text-sm">
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Leave Status Filter */}
                {searchType === "leaves" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Leave Status</label>
                    <div className="space-y-2">
                      {filterOptions.leaveStatus.map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={status}
                            checked={activeFilters.leaveStatus.includes(status)}
                            onCheckedChange={() => toggleArrayFilter("leaveStatus", status)}
                          />
                          <label htmlFor={status} className="text-sm capitalize">
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Salary Range Filter (for employees) */}
                {searchType === "employees" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Salary Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={activeFilters.salaryRange.min}
                        onChange={(e) =>
                          updateFilter("salaryRange", { ...activeFilters.salaryRange, min: Number(e.target.value) })
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={activeFilters.salaryRange.max}
                        onChange={(e) =>
                          updateFilter("salaryRange", { ...activeFilters.salaryRange, max: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {hasActiveFilters() && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.departments.map((dept) => (
            <Badge key={dept} variant="secondary" className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {dept}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayFilter("departments", dept)} />
            </Badge>
          ))}
          {activeFilters.positions.map((position) => (
            <Badge key={position} variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {position}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayFilter("positions", position)} />
            </Badge>
          ))}
          {activeFilters.attendanceStatus.map((status) => (
            <Badge key={status} variant="secondary" className="flex items-center gap-1">
              {status === "Present" ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
              {status}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayFilter("attendanceStatus", status)} />
            </Badge>
          ))}
          {activeFilters.leaveStatus.map((status) => (
            <Badge key={status} variant="secondary" className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {status}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayFilter("leaveStatus", status)} />
            </Badge>
          ))}
        </div>
      )}

      {/* Search Results */}
      {(searchTerm.length > 0 || hasActiveFilters()) && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Search Results</span>
              <Badge variant="outline">{isLoading ? "Searching..." : `${searchResults.length} results`}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p>Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((result) => (
                  <div key={result._id || result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{result.name || result.employeeName || "N/A"}</div>
                      <div className="text-sm text-gray-600">
                        {searchType === "employees" &&
                          `${result.department} • ${result.position} • $${result.salary?.toLocaleString()}`}
                        {searchType === "attendance" && `${result.department} • ${result.date} • ${result.status}`}
                        {searchType === "leaves" && `${result.leaveType} • ${result.startDate} • ${result.status}`}
                      </div>
                    </div>
                    <Badge
                      variant={
                        result.status === "Present" || result.status === "approved"
                          ? "default"
                          : result.status === "pending" || result.status === "Late"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {result.status || "Active"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No results found</p>
                <p className="text-sm">Try adjusting your search terms or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
