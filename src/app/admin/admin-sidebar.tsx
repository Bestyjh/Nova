import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside className="dashboardSidebar">
      <h3>NOVA Admin</h3>

      <nav>
        <Link href="/admin">
          Overview
        </Link>

        <Link href="/admin/courses">
          Courses
        </Link>

        <Link href="/admin/resources">
  Resources
</Link>

        <Link href="/admin/learners">
          Learners
        </Link>

        <Link href="/admin/enrollments">
          Enrollments
        </Link>

        <Link href="/admin/completions">
          Completions
        </Link>
      </nav>

      <div style={{ marginTop: "32px" }}>
        <Link href="/dashboard">
          Learner Dashboard
        </Link>
      </div>
    </aside>
  );
}