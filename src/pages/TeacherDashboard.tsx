import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, TrendingUp, AlertTriangle } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  className: string;
  mastery: number; // 0-100
  streak: number; // days
  atRisk: boolean;
}

const sample: Student[] = [
  { id: "s1", name: "Ava Wright", email: "ava@example.com", className: "Physics 101", mastery: 86, streak: 12, atRisk: false },
  { id: "s2", name: "Liam Patel", email: "liam@example.com", className: "Physics 101", mastery: 62, streak: 3, atRisk: true },
  { id: "s3", name: "Noah Chen", email: "noah@example.com", className: "Algebra II", mastery: 74, streak: 5, atRisk: false },
  { id: "s4", name: "Mia Johnson", email: "mia@example.com", className: "Algebra II", mastery: 41, streak: 1, atRisk: true },
  { id: "s5", name: "Ethan Kim", email: "ethan@example.com", className: "World History", mastery: 91, streak: 21, atRisk: false },
];

const StatCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const TeacherDashboard = () => {
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const total = sample.length;
    const classes = new Set(sample.map((s) => s.className)).size;
    const avg = Math.round(sample.reduce((a, b) => a + b.mastery, 0) / total);
    const risk = sample.filter((s) => s.atRisk).length;
    return { total, classes, avg, risk };
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return sample.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.className.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track class progress, mastery, and at-risk students.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Users className="w-5 h-5" />} title="Students" value={String(stats.total)} />
          <StatCard icon={<GraduationCap className="w-5 h-5" />} title="Classes" value={String(stats.classes)} />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} title="Avg Mastery" value={`${stats.avg}%`} />
          <StatCard icon={<AlertTriangle className="w-5 h-5" />} title="At-Risk" value={String(stats.risk)} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Class Progress</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Search students or classes" value={query} onChange={(e) => setQuery(e.target.value)} className="w-64" />
              <Button variant="outline">Export CSV</Button>
              <Button>New Class</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Mastery</TableHead>
                  <TableHead>Streak</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-muted-foreground text-xs">{s.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{s.className}</TableCell>
                    <TableCell className="w-64">
                      <div className="flex items-center gap-3">
                        <Progress value={s.mastery} className="h-2" />
                        <span className="text-sm font-medium w-12">{s.mastery}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{s.streak}d</TableCell>
                    <TableCell>
                      {s.atRisk ? (
                        <Badge variant="destructive">At Risk</Badge>
                      ) : (
                        <Badge variant="default">On Track</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>Showing {filtered.length} of {sample.length} students.</TableCaption>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
