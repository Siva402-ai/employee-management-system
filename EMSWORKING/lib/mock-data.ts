// lib/mock-data.ts
// Mock interfaces + sample data for EMS (TypeScript)

export interface Employee {
  _id?: string
  employeeId: string
  name: string
  email: string
  dateOfBirth: string
  department: string
  position: string
  salary: number
  image?: string
  createdAt: Date
  updatedAt: Date
}

export interface Department {
  _id?: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Leave {
  _id?: string
  employeeId: string
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  reason: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  updatedAt: Date
}

export interface Salary {
  _id?: string
  employeeId: string
  employeeName: string
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  month: string
  year: number
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  _id?: string
  projectId: string
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  deadline: string
  status: "Pending" | "In-Progress" | "Completed"
  createdAt: string
  files?: string[]
}

export interface Attendance {
  _id?: string
  employeeId: string
  employeeName: string
  department: string
  date: string
  punchIn?: string
  punchOut?: string
  totalHours?: number
  status: "Present" | "Absent" | "Late" | "Early Exit"
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  _id?: string
  type: "leave_request" | "attendance_anomaly" | "birthday" | "work_anniversary" | "system"
  title: string
  message: string
  employeeId?: string
  employeeName?: string
  priority: "low" | "medium" | "high"
  read: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DashboardAnalytics {
  employeeOverview: {
    totalEmployees: number
    departmentWiseCount: { [key: string]: number }
    recentlyAdded: Employee[]
  }
  attendanceAnalytics: {
    monthlyAttendanceSummary: {
      present: number
      absent: number
      late: number
      earlyExit: number
    }
    attendanceTrends: { date: string; present: number; absent: number }[]
    frequentAbsences: { employeeId: string; employeeName: string; absenceCount: number }[]
  }
  leaveAnalytics: {
    leaveStatusOverview: {
      pending: number
      approved: number
      rejected: number
    }
    leaveTrends: { month: string; leaves: number }[]
  }
}

/* -------------------------
   Mock data (development)
   ------------------------- */

export const mockEmployees: Employee[] = [
  {
    _id: "1",
    employeeId: "EMP001",
    name: "John Doe",
    email: "john.doe@company.com",
    dateOfBirth: "1990-05-15",
    department: "Engineering",
    position: "Software Developer",
    salary: 75000,
    image: "/professional-headshot.png",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "2",
    employeeId: "EMP002",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    dateOfBirth: "1988-08-22",
    department: "Marketing",
    position: "Marketing Manager",
    salary: 65000,
    image: "/professional-headshot.png",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "3",
    employeeId: "EMP003",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    dateOfBirth: "1992-03-10",
    department: "Sales",
    position: "Sales Representative",
    salary: 55000,
    image: "/professional-headshot.png",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const mockDepartments: Department[] = [
  {
    _id: "1",
    name: "Engineering",
    description: "Software development and technical operations",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "2",
    name: "Marketing",
    description: "Brand promotion and customer acquisition",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "3",
    name: "Sales",
    description: "Revenue generation and client relations",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "4",
    name: "Human Resources",
    description: "Employee management and organizational development",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const mockLeaves: Leave[] = [
  {
    _id: "1",
    employeeId: "EMP001",
    employeeName: "John Doe",
    leaveType: "Annual Leave",
    startDate: "2024-02-15",
    endDate: "2024-02-20",
    reason: "Family vacation",
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "2",
    employeeId: "EMP002",
    employeeName: "Jane Smith",
    leaveType: "Sick Leave",
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    reason: "Medical appointment",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const mockSalaries: Salary[] = [
  {
    _id: "1",
    employeeId: "EMP001",
    employeeName: "John Doe",
    basicSalary: 60000,
    allowances: 10000,
    deductions: 5000,
    netSalary: 65000,
    month: "January",
    year: 2024,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "2",
    employeeId: "EMP002",
    employeeName: "Jane Smith",
    basicSalary: 55000,
    allowances: 8000,
    deductions: 3000,
    netSalary: 60000,
    month: "January",
    year: 2024,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "3",
    employeeId: "EMP003",
    employeeName: "Mike Johnson",
    basicSalary: 45000,
    allowances: 7000,
    deductions: 2000,
    netSalary: 50000,
    month: "January",
    year: 2024,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const mockProjects: Project[] = [
  {
    _id: "1",
    projectId: "PRJ001",
    title: "Website Redesign",
    description: "Complete redesign of the company website with modern UI/UX",
    assignedTo: "EMP001",
    assignedToName: "John Doe",
    deadline: "2024-03-15",
    status: "In-Progress",
    createdAt: new Date().toISOString(),
    files: [],
  },
  {
    _id: "2",
    projectId: "PRJ002",
    title: "Mobile App Development",
    description: "Develop a mobile application for employee management",
    assignedTo: "EMP002",
    assignedToName: "Jane Smith",
    deadline: "2024-04-20",
    status: "Pending",
    createdAt: new Date().toISOString(),
    files: [],
  },
  {
    _id: "3",
    projectId: "PRJ003",
    title: "Database Migration",
    description: "Migrate legacy database to new cloud infrastructure",
    assignedTo: "EMP003",
    assignedToName: "Mike Johnson",
    deadline: "2024-02-28",
    status: "Completed",
    createdAt: new Date().toISOString(),
    files: [],
  },
]

export const mockAttendance: Attendance[] = [
  {
    _id: "1",
    employeeId: "EMP001",
    employeeName: "John Doe",
    department: "Engineering",
    date: "2024-01-15",
    punchIn: "09:00",
    punchOut: "18:00",
    totalHours: 9,
    status: "Present",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "2",
    employeeId: "EMP002",
    employeeName: "Jane Smith",
    department: "Marketing",
    date: "2024-01-15",
    punchIn: "09:15",
    punchOut: "17:45",
    totalHours: 8.5,
    status: "Late",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "3",
    employeeId: "EMP003",
    employeeName: "Mike Johnson",
    department: "Sales",
    date: "2024-01-15",
    punchIn: "08:45",
    punchOut: "16:30",
    totalHours: 7.75,
    status: "Early Exit",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "4",
    employeeId: "EMP001",
    employeeName: "John Doe",
    department: "Engineering",
    date: "2024-01-16",
    status: "Absent",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const mockNotifications: Notification[] = [
  {
    _id: "1",
    type: "leave_request",
    title: "New Leave Request",
    message: "Jane Smith has requested sick leave from Feb 10-12",
    employeeId: "EMP002",
    employeeName: "Jane Smith",
    priority: "medium",
    read: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "2",
    type: "attendance_anomaly",
    title: "Attendance Alert",
    message: "Mike Johnson has been absent for 3 consecutive days",
    employeeId: "EMP003",
    employeeName: "Mike Johnson",
    priority: "high",
    read: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "3",
    type: "birthday",
    title: "Birthday Reminder",
    message: "John Doe's birthday is today!",
    employeeId: "EMP001",
    employeeName: "John Doe",
    priority: "low",
    read: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "4",
    type: "work_anniversary",
    title: "Work Anniversary",
    message: "Jane Smith completes 2 years with the company today",
    employeeId: "EMP002",
    employeeName: "Jane Smith",
    priority: "low",
    read: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]
