// Reconstructed from real content written across the site's prior rewrites
// (origin/2022's Resume page, origin/2024's Home page) rather than Base44's
// hosted, generic placeholder data. The two most recent entries have
// approximate dates pulled from commit history — confirm before publishing.

export interface Position {
  id: string;
  title: string;
  company: string;
  company_type?: "startup" | "enterprise" | "consulting" | "government" | "non-profit" | "agency";
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
  location?: string;
  description: string;
  accomplishments?: string[];
  technologies?: string[];
}

export const positions: Position[] = [
  {
    id: "privacy-request",
    title: "CTO & Co-Founder",
    company: "Privacy Request",
    company_type: "startup",
    // TODO(thomas): confirm actual start date and whether this is still current.
    start_date: "2022-01-01",
    end_date: null,
    is_current: true,
    location: "Canada",
    description:
      "Head the engineering department at Privacy Request, a Canadian company building software that makes privacy compliance easy — helping organizations manage data subject requests and reduce the time practitioners spend categorizing data. Act as the technical authority across solution, system, data, and business architecture.",
    accomplishments: [
      "Lead architecture and engineering strategy across the platform",
      "Built and grew the engineering team, establishing engineering best practices and hiring processes",
      "Partner with the business on growth strategy and new opportunities",
    ],
    technologies: [
      "Docker", "Python", "Linux", "Git", "Java", "JavaScript", "Node.js",
      "PostgreSQL", "AWS", "CircleCI", "Redis", "React", "Redux", "GraphQL", "Terraform",
    ],
  },
  {
    id: "incipient-industries",
    title: "Co-Founder & CTO",
    company: "Incipient Industries",
    company_type: "startup",
    start_date: "2017-12-01",
    // TODO(thomas): confirm end date — last confirmed active as of a 2022 commit.
    end_date: null,
    location: "Canada",
    description:
      "Incipient Industries is a cryptocurrency software and tooling firm producing next-generation cryptocurrency infrastructure — leveraging high-capacity, fault-tolerant systems and machine learning, with a privacy- and security-oriented, test-driven approach to continuous delivery.",
    technologies: ["Docker", "Python", "Linux", "Git", "Machine Learning"],
  },
  {
    id: "shore-consulting-lead",
    title: "Systems and Development Lead",
    company: "Shore Consulting Group",
    company_type: "consulting",
    start_date: "2011-10-01",
    end_date: "2014-01-01",
    description:
      "Responsible for company hardware/software setup and maintenance, source control and CI infrastructure, and network/system security. Lead developer for a SaaS education information system with a heavy J2EE focus across both SQL and NoSQL datastores. Also maintained legacy PHP projects and supported two government-related projects.",
    accomplishments: [
      "Led architecture and requirements-gathering for a SaaS education information system",
      "Maintained Subversion and Git source control, continuous integration, and testing infrastructure",
      "Supported government projects on MSSQL and Oracle",
    ],
    technologies: [
      "Windows", "Linux", "Subversion", "Git", "Gitlab", "Tomcat", "Java", "Spring", "Struts",
      "PHP", "Ruby", "OracleDB", "JavaScript", "HTML", "CSS", ".NET", "MSSQL", "MySQL", "MongoDB",
      "ElasticSearch", "AWS",
    ],
  },
  {
    id: "shore-consulting-intermediate",
    title: "Intermediate Programmer",
    company: "Shore Consulting Group",
    company_type: "consulting",
    start_date: "2011-05-01",
    end_date: "2011-10-01",
    description:
      "Developer for the education information system, with some client-communication and product-review responsibility. Maintained Linux and Windows infrastructure and contributed Java development to other government-related projects.",
    technologies: ["Linux", "Windows", "PHP", "Java", "Spring", "Struts", "HTML", "CSS", "JavaScript", "OracleDB", "Git", "Tomcat", "Hudson", "Eclipse"],
  },
  {
    id: "shore-consulting-jr",
    title: "Jr. Programmer",
    company: "Shore Consulting Group",
    company_type: "consulting",
    start_date: "2011-01-01",
    end_date: "2011-05-01",
    description:
      "Discovered and fixed a platform-dependency flaw that cut deployment time from roughly two hours to about thirty seconds. Introduced Git and Hudson/Jenkins to further reduce deployment time, alongside stability work on the education information system.",
    accomplishments: [
      "Reduced deployment time from ~2 hours to ~30 seconds by fixing a platform-dependency flaw",
      "Introduced Git and Hudson/Jenkins CI to the team",
    ],
    technologies: ["Linux", "Windows", "PHP", "HTML", "CSS", "JavaScript", "OracleDB", "Git", "Hudson", "Eclipse"],
  },
  {
    id: "georgian-college-2",
    title: "Programmer/Analyst",
    company: "Georgian College",
    company_type: "non-profit",
    start_date: "2010-01-01",
    end_date: "2010-10-01",
    description:
      "Responsible for most portal maintenance, including migrating from Oracle Application Server to Liferay, with a heavy focus on requirements analysis.",
    technologies: ["Java", "HTML", "CSS", "JavaScript", "OracleDB", "Subversion", "Liferay", "Tomcat", "OracleAS", "Hudson", "Eclipse"],
  },
  {
    id: "campuseai",
    title: "Programmer",
    company: "CampusEAI Consortium",
    company_type: "non-profit",
    start_date: "2009-09-01",
    end_date: "2009-12-01",
    location: "Cleveland, OH",
    description:
      "Developed several portal-based J2EE applications for the Liferay platform, working across MySQL and OracleDB with Hypersonic for local development, and researched various subjects resulting in feasibility studies.",
    technologies: ["Java", "HTML", "CSS", "JavaScript", "OracleDB", "Subversion", "Liferay", "Tomcat", "OracleAS", "Hudson", "Eclipse"],
  },
  {
    id: "georgian-college-1",
    title: "Programmer/Analyst",
    company: "Georgian College",
    company_type: "non-profit",
    start_date: "2008-11-01",
    end_date: "2009-09-01",
    description:
      "Designed and implemented department-specific productivity applications built on J2EE services with Oracle Application Server and Oracle DB.",
    accomplishments: [
      "Introduced a Hudson CI + Subversion development workflow, decreasing deployment time by more than 50%",
      "Maintained both Tomcat and Oracle Application Server installations",
    ],
    technologies: ["Java", "HTML", "CSS", "JavaScript", "OracleDB", "Subversion", "Liferay", "Tomcat", "OracleAS", "Hudson", "Eclipse"],
  },
  {
    id: "arcline",
    title: "Jr. Programmer",
    company: "Arcline (2000) Inc.",
    company_type: "enterprise",
    start_date: "2008-05-01",
    end_date: "2008-08-01",
    description:
      "Responsible for client-side and server-side software updates and customer support, including a rewrite of a web-based freight tracking application for improved efficiency and security.",
    technologies: ["Visual FoxPro", "Visual Basic", "Visual Source Safe", "ASP Classic", "HTML", "CSS", "JavaScript"],
  },
  {
    id: "independent-consultant",
    title: "Independent Consultant",
    company: "Thomas P. Wilson",
    company_type: "consulting",
    start_date: "2006-01-01",
    end_date: "2011-01-01",
    description:
      "Provided software design and architecture consulting for small, medium, and large technology organizations, along with development services for new systems and updates to existing ones.",
    technologies: [
      "Linux", "Git", "Hudson", "Gitlab", "Tomcat", "Java", "Spring", "Struts", "PHP", "Ruby",
      "C/C++", "JavaScript", "HTML", "CSS", "Angular.js", "React.js", "Node.js", ".NET", "MSSQL",
      "MySQL", "MongoDB", "ElasticSearch", "Cassandra", "AWS",
    ],
  },
];
