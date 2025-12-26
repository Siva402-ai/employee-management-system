"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Employee {
  id: string
  employeeId: string
  name: string
}

interface EmployeeSelectProps {
  onSelect: (employee: Employee) => void
  className?: string
}

export function EmployeeSelect({ onSelect, className }: EmployeeSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selected, setSelected] = React.useState<Employee | null>(null)

  React.useEffect(() => {
    // Fetch employees when component mounts
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => {
        setEmployees(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching employees:', err)
        setLoading(false)
      })
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={loading}
        >
          {loading ? "Loading..." :
            selected ? `${selected.name} (${selected.employeeId})` : "Select employee..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search employees..." />
          <CommandEmpty>No employee found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {employees.map((employee) => (
              <CommandItem
                key={employee.id}
                value={`${employee.name} ${employee.employeeId}`.toLowerCase()}
                onSelect={() => {
                  setSelected(employee)
                  onSelect(employee)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected?.id === employee.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div>
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-sm text-gray-500">{employee.employeeId}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}