"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const machines = [
  {
    name: "Linha 01",
    oee: 82,
    availability: 88,
    performance: 80,
    quality: 95,
  },
  {
    name: "Linha 02",
    oee: 74,
    availability: 79,
    performance: 76,
    quality: 90,
  },
]

export function MachinesTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>OEE por máquina</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Máquina</TableHead>
              <TableHead>OEE</TableHead>
              <TableHead>Dispon.</TableHead>
              <TableHead>Perf.</TableHead>
              <TableHead>Qualidade</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {machines.map((m) => (
              <TableRow key={m.name}>
                <TableCell>{m.name}</TableCell>
                <TableCell>{m.oee}%</TableCell>
                <TableCell>{m.availability}%</TableCell>
                <TableCell>{m.performance}%</TableCell>
                <TableCell>{m.quality}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
