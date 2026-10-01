"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type FormEvent,
  type ReactNode,
  useState,
} from "react";
import {
  BookOpen,
  CalendarDays,
  FolderOpen,
  LayoutDashboard,
  Search,
  UserRound,
} from "lucide-react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import LogoutButton from "./logout-button";
import styles from "./learner-portal.module.css";

type LearnerPortalShellProps = {
  children: ReactNode;
  firstName: string;
  role: string | null;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
};

const navigation = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/learn",
    label: "My Learning",
    icon: BookOpen,
  },
  {
    href: "/resources",
    label: "Resources",
    icon: FolderOpen,
  },
  {
    href: "/sessions",
    label: "Sessions",
    icon: CalendarDays,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserRound,
  },
];

export default function LearnerPortalShell({
  children,
  firstName,
  role,
  searchQuery,
  onSearchQueryChange,
}: LearnerPortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [localSearchQuery, setLocalSearchQuery] =
    useState("");

  const currentSearchQuery =
    searchQuery ?? localSearchQuery;

  const initials = firstName
    .trim()
    .slice(0, 2)
    .toUpperCase();

  const accountRole =
    role === "admin" ? "Admin" : "Learner";

  function handleSearchChange(value: string) {
    if (onSearchQueryChange) {
      onSearchQueryChange(value);
      return;
    }

    setLocalSearchQuery(value);
  }

  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (onSearchQueryChange) {
      return;
    }

    const query = currentSearchQuery.trim();

    if (!query) {
      router.push("/learn");
      return;
    }

    router.push(
      `/learn?query=${encodeURIComponent(query)}`
    );
  }

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <div className={styles.dashboardPage}>
      <header className={styles.topbar}>
        <Link
          href="/"
          className={styles.brand}
          aria-label="NOVA Wellness & Lifestyle Institute"
        >
          <Image
            src="/nova-logo.png"
            alt="NOVA Wellness & Lifestyle Institute"
            width={190}
            height={54}
            priority
          />
        </Link>

        <form
          className={styles.searchBox}
          role="search"
          onSubmit={handleSearchSubmit}
        >
          <Search
            size={19}
            aria-hidden="true"
          />

          <label
            htmlFor="learner-portal-search"
            className={styles.srOnly}
          >
            Search your learning
          </label>

          <input
            id="learner-portal-search"
            type="search"
            value={currentSearchQuery}
            onChange={(event) =>
              handleSearchChange(
                event.target.value
              )
            }
            placeholder="Search your learning"
          />
        </form>

        <div className={styles.accountArea}>
          <Link
            href="/profile"
            className={styles.profileLink}
          >
            <span className={styles.avatar}>
              {initials || "NL"}
            </span>

            <span className={styles.profileCopy}>
              <strong>{firstName}</strong>
              <small>{accountRole}</small>
            </span>
          </Link>

          <span
            className={styles.accountDivider}
            aria-hidden="true"
          />

          <div className={styles.logoutWrap}>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className={styles.dashboardLayout}>
        <aside className={styles.sidebar}>
          <nav
            className={styles.sidebarNav}
            aria-label="Learner portal"
          >
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(
                item.href
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? styles.activeNavItem
                      : styles.navItem
                  }
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                >
                  <Icon
                    size={19}
                    aria-hidden="true"
                  />

                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.sidebarHelp}>
            <strong>NOVA Learning</strong>

            <p>
              Your learning pathways,
              resources, sessions and
              achievements in one place.
            </p>
          </div>
        </aside>

        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}