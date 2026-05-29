"use client";

const AUTHORS = [
  {
    name: "Dr. Swati Abhishek Mishra",
    role: "Founder, EduAbroad",
    initials: "SM",
    image: "/authors/swati.jpeg", // place photo in /public/authors/swati.jpg
    bio: "Former Professor at IIM Lucknow, Dr. Swati founded EduAbroad with a mission to make world-class international education accessible to every Indian student. She holds a Master's in Management from a joint programme with the University of Cambridge and MIT, and a PhD in Strategy & Marketing from the University of Cambridge. She personally oversees curriculum, counsellor training, and student outcomes.",
    linkedin: "https://www.linkedin.com/in/swati-abhishek-mishra/",
  },
  {
    name: "Aradhya Vats",
    role: "CEO, EduAbroad",
    initials: "AV",
    image: "/authors/aradhya.jpeg", // place photo in /public/authors/aradhya.jpg
    bio: "Aradhya leads EduAbroad's operations, product, and growth — building the systems that help thousands of students navigate university shortlisting, visa applications, and scholarship searches each year. As CEO, he focuses on making personalised study-abroad guidance scalable, data-driven, and student-first.",
    linkedin: "https://www.linkedin.com/in/aradhya-vats/",
  },
];
export function ArticleAuthors() {
  return (
    <div className="mt-12 pt-8 border-t border-gray-100">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-[#A51C30] flex items-center justify-center">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <p className="text-[13px] font-semibold text-gray-800">
          About the authors
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {AUTHORS.map((author) => (
          <div
            key={author.name}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm shadow-gray-100/50 flex gap-4"
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100">
              {author.image ? (
                <img
                  src={author.image}
                  alt={author.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // fallback to initials if image fails to load
                    const target = e.currentTarget;
                    target.style.display = "none";
                    target.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full bg-gradient-to-br from-[#A51C30] to-[#d4243e] flex items-center justify-center ${author.image ? "hidden" : ""}`}
              >
                <span className="text-white text-xs font-bold">
                  {author.initials}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {author.name}
                  </p>
                  <p className="text-[11px] text-[#A51C30] font-semibold mt-0.5">
                    {author.role}
                  </p>
                </div>

                <a
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 hover:border-[#0077B5] hover:text-[#0077B5] hover:bg-blue-50 transition-all shrink-0"
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </div>
              <p className="text-[12.5px] text-gray-500 leading-relaxed mt-2">
                {author.bio}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
