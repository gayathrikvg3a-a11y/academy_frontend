import {
  BookOpenText,
  Briefcase,
  CalendarDays,
  Camera,
  Contact,
  CreditCard,
  Factory,
  GalleryHorizontal,
  Globe,
  GraduationCap,
  IdCard,
  Images,
  LayoutDashboard,
  Library,
  ListOrdered,
  Megaphone,
  MessageSquareQuote,
  Newspaper,
  PhoneCall,
  School,
  Tags,
  Users,
} from "lucide-react";

export const NAV_GROUPS = [
  {
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Enquiries",
    items: [
      { title: "Enquiries", url: "/enquiries", icon: PhoneCall },
      { title: "Website Enquiries", url: "/website-enquiries", icon: Globe },
    ],
  },
  {
    label: "Team",
    items: [{ title: "Staff", url: "/staff", icon: IdCard }],
  },
  {
    label: "Students",
    items: [
      { title: "Students", url: "/students", icon: GraduationCap },
      { title: "Internships", url: "/internships", icon: Users },
    ],
  },
  {
    label: "Announcements",
    items: [{ title: "Announcements", url: "/announcements", icon: Megaphone }],
  },
  {
    label: "Careers",
    items: [{ title: "Vacancies", url: "/vacancies", icon: Briefcase }],
  },
  
  {
    label: "Payments",
    items: [
      { title: "Payments", url: "/payments", icon: CreditCard },
      { title: "Payment Types", url: "/payment-type", icon: CreditCard },
    
    ],
            

  },
  {
    label: "Learning",
    items: [
      { title: "Courses", url: "/courses", icon: Library },
      { title: "Course Categories", url: "/course-categories", icon: Tags },
      { title: "Batches", url: "/batches", icon: ListOrdered },
    ],
  },

  {
    label: "Media",
    items: [
      { title: "Events", url: "/events", icon: CalendarDays },
      { title: "Gallery", url: "/gallery", icon: Images },
      { title: "Life at Cignes", url: "/life-at-cignes", icon: Camera },
      { title: "Academic Internship", url: "/academic-internships", icon: School },
      { title: "Industry Internship", url: "/industry-internships", icon: Factory },
      { title: "Banners", url: "/banners", icon: GalleryHorizontal },
      { title: "Blogs", url: "/blogs", icon: Newspaper },
      { title: "Case Studies", url: "/case-studies", icon: BookOpenText },
      { title: "Testimonials", url: "/testimonials", icon: MessageSquareQuote },
    ],
  },
  {
    label: "Contact",
    items: [
      { title: "Contact Information", url: "/contact-information", icon: Contact },
    ],
  },
];
