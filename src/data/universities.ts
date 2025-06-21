export interface University {
  id: string;
  name: string;
  shortName: string;
  type: "public" | "private";
  faculties: Faculty[];
}

export interface Faculty {
  name: string;
  departments: Department[];
}

export interface Department {
  name: string;
  programs: Program[];
}

export interface Program {
  name: string;
  level: "bachelor" | "master" | "phd";
  duration: string;
  type?: "distance" | "joint" | "integrated";
  ects?: number;
}

export const CYPRUS_UNIVERSITIES: University[] = [
  {
    id: "ucy",
    name: "University of Cyprus",
    shortName: "UCY",
    type: "public",
    faculties: [
      {
        name: "Faculty of Humanities",
        departments: [
          {
            name: "English Studies",
            programs: [
              {
                name: "English Studies",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "English Literature",
                level: "master",
                duration: "2 years",
              },
            ],
          },
          {
            name: "French and European Studies",
            programs: [
              {
                name: "French Studies",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "European Studies",
                level: "master",
                duration: "2 years",
              },
            ],
          },
          {
            name: "Turkish and Middle Eastern Studies",
            programs: [
              {
                name: "Turkish Studies",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Middle Eastern Studies",
                level: "master",
                duration: "2 years",
              },
            ],
          },
        ],
      },
      {
        name: "Faculty of Pure and Applied Sciences",
        departments: [
          {
            name: "Computer Science",
            programs: [
              {
                name: "Computer Science",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Computer Science",
                level: "master",
                duration: "2 years",
              },
              { name: "Computer Science", level: "phd", duration: "3-4 years" },
            ],
          },
          {
            name: "Mathematics and Statistics",
            programs: [
              { name: "Mathematics", level: "bachelor", duration: "4 years" },
              { name: "Statistics", level: "master", duration: "2 years" },
            ],
          },
          {
            name: "Physics",
            programs: [
              { name: "Physics", level: "bachelor", duration: "4 years" },
              { name: "Applied Physics", level: "master", duration: "2 years" },
            ],
          },
          {
            name: "Chemistry",
            programs: [
              { name: "Chemistry", level: "bachelor", duration: "4 years" },
              { name: "Chemistry", level: "master", duration: "2 years" },
            ],
          },
          {
            name: "Biological Sciences",
            programs: [
              { name: "Biology", level: "bachelor", duration: "4 years" },
              {
                name: "Molecular Biology",
                level: "master",
                duration: "2 years",
              },
            ],
          },
        ],
      },
      {
        name: "Medical School",
        departments: [
          {
            name: "Medical",
            programs: [
              { name: "Medicine", level: "bachelor", duration: "6 years" },
              { name: "Medical Sciences", level: "phd", duration: "4 years" },
            ],
          },
        ],
      },
      {
        name: "Faculty of Social Sciences and Education",
        departments: [
          {
            name: "Education",
            programs: [
              {
                name: "Primary Education",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Educational Sciences",
                level: "master",
                duration: "2 years",
              },
            ],
          },
          {
            name: "Psychology",
            programs: [
              { name: "Psychology", level: "bachelor", duration: "4 years" },
              {
                name: "Clinical Psychology",
                level: "master",
                duration: "2 years",
              },
            ],
          },
          {
            name: "Law",
            programs: [
              { name: "Law", level: "bachelor", duration: "4 years" },
              { name: "European Law", level: "master", duration: "2 years" },
            ],
          },
        ],
      },
      {
        name: "Faculty of Economics and Management",
        departments: [
          {
            name: "Business and Public Administration",
            programs: [
              {
                name: "Business Administration",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Public Administration",
                level: "master",
                duration: "2 years",
              },
            ],
          },
          {
            name: "Economics",
            programs: [
              { name: "Economics", level: "bachelor", duration: "4 years" },
              {
                name: "Applied Economics",
                level: "master",
                duration: "2 years",
              },
            ],
          },
          {
            name: "Accounting and Finance",
            programs: [
              { name: "Accounting", level: "bachelor", duration: "4 years" },
              { name: "Finance", level: "master", duration: "2 years" },
            ],
          },
        ],
      },
      {
        name: "Faculty of Engineering",
        departments: [
          {
            name: "Architecture",
            programs: [
              {
                name: "Architecture",
                level: "bachelor",
                duration: "5 years",
                type: "integrated",
              },
            ],
          },
          {
            name: "Civil and Environmental Engineering",
            programs: [
              {
                name: "Civil Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Environmental Engineering",
                level: "master",
                duration: "2 years",
              },
            ],
          },
          {
            name: "Electrical and Computer Engineering",
            programs: [
              {
                name: "Electrical Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Computer Engineering",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
          {
            name: "Mechanical and Manufacturing Engineering",
            programs: [
              {
                name: "Mechanical Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Manufacturing Engineering",
                level: "master",
                duration: "2 years",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "ouc",
    name: "Open University of Cyprus",
    shortName: "OUC",
    type: "public",
    faculties: [
      {
        name: "School of Humanities and Social Sciences",
        departments: [
          {
            name: "Business Studies",
            programs: [
              {
                name: "Business Administration",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
          {
            name: "Law",
            programs: [{ name: "Law", level: "bachelor", duration: "4 years" }],
          },
          {
            name: "Hellenic Culture Studies",
            programs: [
              {
                name: "Studies in Hellenic Culture",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "unic",
    name: "University of Nicosia",
    shortName: "UNIC",
    type: "private",
    faculties: [
      {
        name: "School of Business",
        departments: [
          {
            name: "Business Administration",
            programs: [
              { name: "Accounting", level: "bachelor", duration: "4 years" },
              {
                name: "Business Administration",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Business Administration",
                level: "bachelor",
                duration: "4 years",
                type: "distance",
              },
              {
                name: "Business Administration in Tourism, Leisure and Events Management",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Business Administration: Entrepreneurship and Innovation",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Business Administration: Finance and Economics",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Business Administration: Management and Human Resources",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Business Administration: Marketing and Digital Media",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Hospitality Management",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Management in the Energy, Oil & Gas Business",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Management Information Systems",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Marketing Management",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Sports Management",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
        ],
      },
      {
        name: "School of Education",
        departments: [
          {
            name: "Education",
            programs: [
              { name: "Dance", level: "bachelor", duration: "4 years" },
              { name: "Music", level: "bachelor", duration: "4 years" },
              {
                name: "Pre-Primary Education",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Primary Education",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
        ],
      },
      {
        name: "School of Humanities and Social Sciences",
        departments: [
          {
            name: "Architecture and Design",
            programs: [
              {
                name: "Architecture",
                level: "master",
                duration: "5 years",
                type: "integrated",
              },
              { name: "Architecture", level: "bachelor", duration: "4 years" },
            ],
          },
          {
            name: "Communications and Media",
            programs: [
              {
                name: "Digital Communications and Mass Media",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Graphic and Digital Design",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Interactive Media and Animation",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Interior Design",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
          {
            name: "Psychology",
            programs: [
              { name: "Psychology", level: "bachelor", duration: "4 years" },
              {
                name: "Clinical Psychology",
                level: "master",
                duration: "3 years",
              },
              {
                name: "Counseling Psychology",
                level: "master",
                duration: "2.5 years",
              },
              {
                name: "Educational Psychology",
                level: "master",
                duration: "1.5 years",
              },
              {
                name: "School Psychology",
                level: "master",
                duration: "2.5 years",
              },
            ],
          },
        ],
      },
      {
        name: "School of Law",
        departments: [
          {
            name: "Law",
            programs: [
              { name: "Law", level: "bachelor", duration: "4 years" },
              {
                name: "International Relations and European Studies",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
        ],
      },
      {
        name: "School of Life and Health Sciences",
        departments: [
          {
            name: "Health Sciences",
            programs: [
              { name: "Human Biology", level: "bachelor", duration: "4 years" },
              { name: "Nursing", level: "bachelor", duration: "4 years" },
              {
                name: "Nutrition and Dietetics",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Pharmacy",
                level: "master",
                duration: "5 years",
                type: "integrated",
              },
              { name: "Physiotherapy", level: "bachelor", duration: "4 years" },
              {
                name: "Sports Science",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
        ],
      },
      {
        name: "Medical School",
        departments: [
          {
            name: "Medicine",
            programs: [
              { name: "Medicine", level: "bachelor", duration: "5 years" },
              { name: "Medicine", level: "bachelor", duration: "6 years" },
            ],
          },
        ],
      },
      {
        name: "School of Sciences and Engineering",
        departments: [
          {
            name: "Engineering",
            programs: [
              {
                name: "Civil and Environmental Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Computer Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Computer Science",
                level: "bachelor",
                duration: "4 years",
              },
              { name: "Data Science", level: "bachelor", duration: "4 years" },
              {
                name: "Electrical Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Mechanical Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Oil and Gas Engineering",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
        ],
      },
      {
        name: "School of Veterinary Medicine",
        departments: [
          {
            name: "Veterinary Medicine",
            programs: [
              {
                name: "Veterinary Medicine",
                level: "bachelor",
                duration: "5 years",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "euc",
    name: "European University Cyprus",
    shortName: "EUC",
    type: "private",
    faculties: [
      {
        name: "School of Medicine",
        departments: [
          {
            name: "Medicine",
            programs: [
              { name: "Medicine", level: "bachelor", duration: "6 years" },
            ],
          },
        ],
      },
      {
        name: "School of Business Administration",
        departments: [
          {
            name: "Business",
            programs: [
              { name: "Accounting", level: "bachelor", duration: "4 years" },
              {
                name: "Aviation Management",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Business Studies",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Business Studies",
                level: "bachelor",
                duration: "4 years",
                type: "distance",
              },
              {
                name: "Economics and Finance",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Hospitality and Tourism Management",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Marketing and Digital Communications",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Marketing and Digital Communications",
                level: "bachelor",
                duration: "4 years",
                type: "distance",
              },
            ],
          },
        ],
      },
      {
        name: "School of Sciences",
        departments: [
          {
            name: "Life Sciences",
            programs: [
              {
                name: "Biological Sciences (General Biology)",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Biological Sciences (General Microbiology)",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Biomedical Sciences",
                level: "bachelor",
                duration: "4 years",
              },
              { name: "Nursing", level: "bachelor", duration: "4 years" },
              {
                name: "Nutrition and Dietetics",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Occupational Therapy",
                level: "bachelor",
                duration: "4 years",
              },
              { name: "Pharmacy", level: "bachelor", duration: "5 years" },
              { name: "Physiotherapy", level: "bachelor", duration: "4 years" },
              {
                name: "Speech and Language Therapy",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Sports Science and Physical Education",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
          {
            name: "Computer Science and Engineering",
            programs: [
              {
                name: "Computer Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Computer Information Systems",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Computer Science",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Electrical and Electronic Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              { name: "Mathematics", level: "bachelor", duration: "4 years" },
            ],
          },
        ],
      },
      {
        name: "School of Law",
        departments: [
          {
            name: "Law",
            programs: [
              {
                name: "Law - Cyprus Law",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Law - Greek Law",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
        ],
      },
      {
        name: "School of Humanities, Social and Education Sciences",
        departments: [
          {
            name: "Education",
            programs: [
              {
                name: "Early Childhood Education",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
          {
            name: "Humanities",
            programs: [
              {
                name: "English Studies",
                level: "bachelor",
                duration: "4 years",
                type: "distance",
              },
              {
                name: "Graphic Design",
                level: "bachelor",
                duration: "4 years",
              },
              { name: "Music", level: "bachelor", duration: "4 years" },
              { name: "Psychology", level: "bachelor", duration: "4 years" },
              {
                name: "Psychology",
                level: "bachelor",
                duration: "4 years",
                type: "distance",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "frederick",
    name: "Frederick University",
    shortName: "Frederick",
    type: "private",
    faculties: [
      {
        name: "Arts, Communication & Cultural Studies",
        departments: [
          {
            name: "Arts and Design",
            programs: [
              {
                name: "Fashion and Image Design",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Interior Design",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Visual Communication",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
          {
            name: "Journalism",
            programs: [
              { name: "Journalism", level: "bachelor", duration: "4 years" },
            ],
          },
        ],
      },
      {
        name: "Business & Law",
        departments: [
          {
            name: "Business",
            programs: [
              {
                name: "Business Administration",
                level: "bachelor",
                duration: "4 years",
                type: "distance",
              },
              {
                name: "Accounting and Finance",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Business Administration",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Maritime Studies",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
          {
            name: "Law",
            programs: [{ name: "Law", level: "bachelor", duration: "4 years" }],
          },
        ],
      },
      {
        name: "Engineering",
        departments: [
          {
            name: "Engineering",
            programs: [
              {
                name: "Automotive Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Civil Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Computer Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Computer Science",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Electrical Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Mechanical Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Architectural Engineering",
                level: "master",
                duration: "5 years",
                type: "integrated",
              },
            ],
          },
        ],
      },
      {
        name: "Education & Social Sciences",
        departments: [
          {
            name: "Education",
            programs: [
              {
                name: "Pre-primary Education",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Primary Education",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
          {
            name: "Social Sciences",
            programs: [
              { name: "Social Work", level: "bachelor", duration: "4 years" },
              { name: "Psychology", level: "bachelor", duration: "4 years" },
            ],
          },
        ],
      },
      {
        name: "Health Sciences",
        departments: [
          {
            name: "Health Sciences",
            programs: [
              { name: "Nursing", level: "bachelor", duration: "4 years" },
              { name: "Pharmacy", level: "bachelor", duration: "5 years" },
              {
                name: "Physical Education and Sport Sciences",
                level: "bachelor",
                duration: "4 years",
              },
              { name: "Physiotherapy", level: "bachelor", duration: "4 years" },
              {
                name: "Applied Biomedical Sciences",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "uclan",
    name: "University of Central Lancashire Cyprus",
    shortName: "UCLan Cyprus",
    type: "private",
    faculties: [
      {
        name: "School of Business and Management",
        departments: [
          {
            name: "Business",
            programs: [
              {
                name: "Advertising and Marketing Communications",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Hospitality and Tourism Management",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Accounting and Finance",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Business Administration",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
        ],
      },
      {
        name: "School of Law",
        departments: [
          {
            name: "Law",
            programs: [
              { name: "Laws", level: "bachelor", duration: "4 years" },
            ],
          },
        ],
      },
      {
        name: "School of Sciences",
        departments: [
          {
            name: "Engineering and Computing",
            programs: [
              {
                name: "Computer Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Electrical & Electronic Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              { name: "Computing", level: "bachelor", duration: "4 years" },
            ],
          },
          {
            name: "Mathematics and Sciences",
            programs: [
              {
                name: "Mathematics & Statistics",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Sport & Exercise Science",
                level: "bachelor",
                duration: "4 years",
              },
              { name: "Psychology", level: "bachelor", duration: "4 years" },
            ],
          },
        ],
      },
      {
        name: "School of Arts, Media & Communication",
        departments: [
          {
            name: "Design and Media",
            programs: [
              {
                name: "Graphic Design",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Fashion Design",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Media Production",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Web Design & Development",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
          {
            name: "Languages",
            programs: [
              {
                name: "English Language & Literature",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "neapolis",
    name: "Neapolis University Pafos",
    shortName: "Neapolis",
    type: "private",
    faculties: [
      {
        name: "School of Economics, Business and Computer Science",
        departments: [
          {
            name: "Business and Economics",
            programs: [
              {
                name: "Accounting, Banking and Finance",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Business Administration",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Digital Business",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
          {
            name: "Computer Science",
            programs: [
              {
                name: "Applied Computer Science",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Computer Science and Artificial Intelligence",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
        ],
      },
      {
        name: "School of Architecture, Engineering, Land & Sciences",
        departments: [
          {
            name: "Architecture and Engineering",
            programs: [
              { name: "Architecture", level: "bachelor", duration: "5 years" },
              {
                name: "Civil Engineering",
                level: "bachelor",
                duration: "4 years",
              },
              {
                name: "Real Estate Valuation and Development",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
        ],
      },
      {
        name: "School of Health Sciences",
        departments: [
          {
            name: "Psychology",
            programs: [
              { name: "Psychology", level: "bachelor", duration: "4 years" },
            ],
          },
        ],
      },
      {
        name: "School of Law",
        departments: [
          {
            name: "Law",
            programs: [{ name: "Law", level: "bachelor", duration: "4 years" }],
          },
        ],
      },
      {
        name: "School of Social Sciences, Arts and Humanities",
        departments: [
          {
            name: "International Relations",
            programs: [
              {
                name: "International Relations & Security",
                level: "bachelor",
                duration: "4 years",
              },
            ],
          },
        ],
      },
    ],
  },
];

// Helper functions to get data
export const getAllUniversities = (): University[] => CYPRUS_UNIVERSITIES;

export const getUniversityById = (id: string): University | undefined =>
  CYPRUS_UNIVERSITIES.find((uni) => uni.id === id);

export const getUniversityNames = (): string[] =>
  CYPRUS_UNIVERSITIES.map((uni) => uni.name);

export const getAllPrograms = (): Program[] => {
  const programs: Program[] = [];
  CYPRUS_UNIVERSITIES.forEach((uni) => {
    uni.faculties.forEach((faculty) => {
      faculty.departments.forEach((dept) => {
        programs.push(...dept.programs);
      });
    });
  });
  return programs;
};

export const getProgramsByLevel = (
  level: "bachelor" | "master" | "phd",
): Program[] => {
  return getAllPrograms().filter((program) => program.level === level);
};

export const getDepartmentsByUniversity = (
  universityId: string,
): Department[] => {
  const university = getUniversityById(universityId);
  if (!university) return [];

  const departments: Department[] = [];
  university.faculties.forEach((faculty) => {
    departments.push(
      ...faculty.departments.filter(
        (dept) => dept.name && dept.name.trim() !== "",
      ),
    );
  });
  return departments;
};
