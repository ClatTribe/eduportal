import * as fs from 'fs';

const top5 = [
  '559281d6-d75c-4c0c-99dd-f7bb486d2237',
  '10516caa-0590-485f-bc0c-8e47d7359dea',
  '8c1d7cbb-9f59-439d-9679-1632db02067f',
  '30ed1d50-4c72-4aea-9a77-00eaaa8a7167',
  '44fc512c-0100-4cde-b065-39dabf44c1ec'
];

const mentors = [
  { name: 'Uday Parmar', unis: [], headline: 'Admissions Specialist', bio: 'Expert in guiding students for global admissions and course selection.', specs: ['Business Administration'], degree: ['Masters'], countries: ['USA', 'UK'], sort_order: 0 },
  { name: 'Anshuman Khanna', unis: [], headline: 'Finance & Accounting Specialist', bio: 'Specializes in finance, accounting, and CA-related global pathways.', specs: ['Finance', 'Accounting'], degree: ['Masters'], countries: ['UK', 'Australia'], sort_order: 0 },
  { name: 'Prashasti Parmar', unis: ['University of Leeds'], headline: 'University of Leeds Alumnus', bio: 'Guides students targeting top UK universities with strong personal statements.', specs: ['Management', 'Marketing'], degree: ['Masters'], countries: ['UK'], sort_order: 0 },
  { name: 'Shalinii Kapoor', unis: [], headline: 'Creative & Arts Portfolios', bio: 'Specialist for design, architecture, and fine arts portfolios.', specs: ['Design', 'Fine Arts'], degree: ['Bachelors', 'Masters'], countries: ['USA', 'Italy'], sort_order: 0 },
  { name: 'Vishisht Tiwari', unis: [], headline: 'Engineering & Tech Mentor', bio: 'Core engineering applicant mentor with industry insights.', specs: ['Engineering', 'Computer Science'], degree: ['Masters'], countries: ['USA', 'Germany'], sort_order: 0 },
  { name: 'Priyam Trivedi', unis: ['University of Michigan', 'Purdue University'], headline: 'Michigan & Purdue Alumnus', bio: 'Expert for top-tier US engineering and technology programs.', specs: ['Computer Science', 'Engineering'], degree: ['Masters'], countries: ['USA'], sort_order: 0 },
  { name: 'Sumit Goenka', unis: ['Carnegie Mellon University'], headline: 'Carnegie Mellon Alumnus', bio: 'Focuses on highly competitive computer science and data science programs.', specs: ['Computer Science', 'Data Science'], degree: ['Masters'], countries: ['USA'], sort_order: 0 },
  { name: 'Trushal Choksi', unis: ['University of Michigan', 'Purdue University'], headline: 'US Admissions Expert', bio: 'Engineering and quantitative program specialist for top US institutions.', specs: ['Engineering', 'Data Science'], degree: ['Masters'], countries: ['USA'], sort_order: 0 },
  { name: 'Deeban Chakravarthi Mathivanan', unis: [], headline: 'Science & Tech Admissions', bio: 'Mentors students for research-heavy and specialized science programs.', specs: ['Computer Science', 'Physics'], degree: ['Masters'], countries: ['USA', 'Canada'], sort_order: 0 },
  { name: 'Gauri Malhotra', unis: ['USC'], headline: 'USC Alumnus', bio: 'Specializes in West Coast universities and communication programs.', specs: ['Media Studies', 'Communication'], degree: ['Masters'], countries: ['USA'], sort_order: 0 },
  { name: 'Neha Mishra', unis: ['Lancaster University'], headline: 'UK Admissions Specialist', bio: 'Guides students for top UK universities and business schools.', specs: ['Business Administration', 'Management'], degree: ['Masters'], countries: ['UK'], sort_order: 0 },
  { name: 'Abhishek Kumar', unis: [], headline: 'Undergraduate Strategy', bio: 'Expert in profile building for high school students aiming abroad.', specs: ['Liberal Arts', 'Computer Science'], degree: ['Bachelors'], countries: ['USA', 'Canada'], sort_order: 0 },
  { name: 'Shri Jai Shankar Mishra', unis: [], headline: 'Public Policy & Law', bio: 'Expert in UPSC, public policy, and government-related global studies.', specs: ['Public Policy', 'Law'], degree: ['Masters'], countries: ['UK', 'USA'], sort_order: 0 },
  { name: 'Aastha Mohapatra', unis: ['University of Oxford'], headline: 'Profile Building Mentor, Oxford Alumnus', bio: 'Aastha Mohapatra is a Profile Building Mentor at EduAbroad, dedicated to helping ambitious students stand out in global university admissions. An Oxford graduate with an MPhil in Development Economics...', specs: ['Economics', 'Public Policy'], degree: ['Masters'], countries: ['UK', 'USA'], sort_order: 0 },
  { name: 'Abhiyant Tiwari', unis: ['Harvard University'], headline: 'Harvard Alumnus', bio: 'Mentors top-tier ivy league applicants for masters and PhDs.', specs: ['Public Health', 'Management'], degree: ['Masters', 'PhD'], countries: ['USA'], sort_order: -10 },
  { name: 'Ajay Sharma', unis: ['Michigan Ross School of Business'], headline: 'Ross Business School Alumnus', bio: 'MBA and top business program application strategist.', specs: ['Business Administration', 'MBA'], degree: ['MBA', 'Masters'], countries: ['USA'], sort_order: -10 },
  { name: 'Anumeha Srivastava', unis: ['University of Maryland', 'NIT'], headline: 'UMD & NIT Alumnus', bio: 'Specialist for engineering graduates seeking global masters.', specs: ['Engineering', 'Computer Science'], degree: ['Masters'], countries: ['USA'], sort_order: -10 },
  { name: 'Ashwini Mishra', unis: [], headline: 'Business & Management Mentor', bio: 'B2B and corporate experience applied to MBA admissions.', specs: ['Management', 'Marketing'], degree: ['MBA'], countries: ['USA', 'UK'], sort_order: -10 },
  { name: 'Divya Mishra', unis: ['Lancaster University Management School'], headline: 'Lancaster Management Alumnus', bio: 'UK business school expert for MiM and MBA candidates.', specs: ['Management', 'Business Administration'], degree: ['Masters'], countries: ['UK'], sort_order: -10 },
  { name: 'Alexander Blandl', unis: ['University of Cambridge', 'University of St Andrews'], headline: 'Cambridge & St Andrews Alumnus', bio: 'UK Russell Group and Oxbridge application specialist.', specs: ['Liberal Arts', 'Economics'], degree: ['Bachelors', 'Masters'], countries: ['UK'], sort_order: -10 },
  { name: 'Mayank Nigam', unis: ['University of Oxford', 'IIT BHU'], headline: 'Oxford & IIT BHU Alumnus', bio: 'Top engineering to global elite institution transitions.', specs: ['Engineering', 'Data Science'], degree: ['Masters'], countries: ['UK', 'USA'], sort_order: -10 },
  { name: 'Naina Sharma', unis: [], headline: 'Global Admissions Strategist', bio: 'Helps students craft compelling narratives for holistic admissions.', specs: ['Psychology', 'Liberal Arts'], degree: ['Bachelors'], countries: ['USA', 'Canada'], sort_order: -10 },
  { name: 'Natasha Athanasiadou', unis: ['University of Cambridge'], headline: 'Cambridge Alumnus', bio: 'Guides students through the rigorous Oxbridge interview process.', specs: ['Law', 'Public Policy'], degree: ['Masters'], countries: ['UK'], sort_order: -10 },
  { name: 'Adwait Vikram Singh', unis: ['Harvard Law School'], headline: 'Harvard Law Alumnus', bio: 'Elite law school admissions, JD and LLM specialist.', specs: ['Law', 'International Law'], degree: ['Masters'], countries: ['USA'], sort_order: -10 },
  { name: 'Prithvi Raj', unis: ['George Washington University', 'IIT BHU'], headline: 'GWU & IIT BHU Alumnus', bio: 'Engineering and tech policy program expert.', specs: ['Engineering', 'Public Policy'], degree: ['Masters'], countries: ['USA'], sort_order: -10 },
  { name: 'Rohit Sharma', unis: ['MIT Sloan', 'IIT BHU'], headline: 'MIT Sloan & IIT BHU Alumnus', bio: 'MBA and technology management applications.', specs: ['Business Administration', 'Engineering'], degree: ['MBA'], countries: ['USA'], sort_order: -10 },
  { name: 'Shikha Kedia', unis: [], headline: 'MBA Marketing Specialist', bio: 'Marketing and brand management master\'s programs.', specs: ['Marketing', 'Management'], degree: ['Masters'], countries: ['USA', 'UK'], sort_order: -10 },
  { name: 'Shiraj Khan', unis: ['Carnegie Mellon University'], headline: 'Carnegie Mellon Alumnus', bio: 'Tech and quantitative finance applications.', specs: ['Computer Science', 'Finance'], degree: ['Masters'], countries: ['USA'], sort_order: -10 }
];

let sql = `DELETE FROM mentors WHERE id NOT IN ('${top5.join("', '")}');\n\n`;

for (const m of mentors) {
  const specs = `ARRAY[${m.specs.map(s => `'${s}'`).join(',')}]::text[]`;
  const degrees = `ARRAY[${m.degree.map(s => `'${s}'`).join(',')}]::text[]`;
  const countries = `ARRAY[${m.countries.map(s => `'${s}'`).join(',')}]::text[]`;
  const unis = `ARRAY[${m.unis.map(s => `'${s}'`).join(',')}]::text[]`;
  
  sql += `INSERT INTO mentors (id, full_name, headline, bio, specializations, degree_level, countries, universities, years_experience, students_guided, rating, status, sort_order) VALUES (
    gen_random_uuid(),
    '${m.name.replace(/'/g, "''")}',
    '${m.headline.replace(/'/g, "''")}',
    '${m.bio.replace(/'/g, "''")}',
    ${specs},
    ${degrees},
    ${countries},
    ${unis},
    5,
    100,
    4.5,
    'active',
    ${m.sort_order}
  );\n`;
}

fs.writeFileSync('output.sql', sql);
