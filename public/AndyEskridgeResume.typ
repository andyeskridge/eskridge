#set page(width: 8.5in, height: 11in, margin: 1in)
#set text(font: "Helvetica", size: 10pt)
#set heading(numbering: none)
#show heading.where(level: 1): it => block(spacing: 0.4em, strong(upper(it)))
#show heading.where(level: 2): it => block(spacing: 0.3em, strong(it))

#let resume-role(
  company,
  location,
  dates,
  title,
  bullets,
  title-dates: none,
) = block[
  #set text(weight: "semibold")
  #text(company) #h(0.6em) \hfill #text(location) #h(0.6em) #text(dates)
  #set text(weight: "regular")
  #if title-dates != none {
    #text(weight: "semibold")[#title] #h(0.6em) \hfill #text(title-dates)
  } else {
    #text(weight: "semibold")[#title]
  }
  #list(bullets, marker: "•", spacing: 0.35em)
]

#align(center)[
  #text(size: 20pt, weight: "bold")[ANDY ESKRIDGE]
  \n
  850.341.9336 \| andy@eskridge.dev \| eskridge.dev \| Dallas, TX
]

#v(0.75em)

#heading(1)[Senior Engineering Manager]
Senior Engineering Manager with extensive experience in managing product development, software engineering, and quality assurance teams. Demonstrates the ability to produce highly productive and effective teams through technological expertise and empathetic leadership, fostering value through trust and personal investment in team members. Proven success in managing expanding markets, delivering multiple products, and achieving impressive results within deadlines. Capable of taking complete ownership of the design, development, testing, deployment, and maintenance of software applications, systems, and technology projects.

#heading(1)[Experience]

#resume-role(
  company: "Stellar Elements",
  location: "Dallas, TX",
  dates: "2022 -- Present",
  title: "Associate Director",
  bullets: (
    "Provided technical oversight and management for employees consulting at Chick-fil-A",
    "Ensured technical excellence for the Payment, Ordering, Fulfillment, and Engagement teams at CFA",
    "Technical lead for DreamWorks Animation Digital Asset Management Project",
    "Responsible for over $20m in contracted teams",
    "Leading R&D efforts in GenAI/ML across Stellar Elements",
    "Managed a team of 25 engineers ranging in experience from junior to senior managers"
  ),
)

#resume-role(
  company: "Stellar Elements",
  location: "Dallas, TX",
  dates: "2022 -- Present",
  title: "Senior Solution Architect",
  bullets: (
    "Managed an SRE team of five developers and one business analyst",
    "Helped a banking client manage the sale of their retail business to another bank",
    "Collaborated with product management and the client to prioritize development efforts",
    "Led the rollout of repository access controls to provide separation of duties across the bank's 300+ projects",
    "Automated application deployments utilizing Ansible Tower, speeding up deployments and removing manual errors"
  ),
)

#resume-role(
  company: "Cenergistic",
  location: "Dallas, TX",
  dates: "2018 -- 2022",
  title: "Chief Technical Officer",
  title-dates: "2021 -- 2022",
  bullets: (
    "Engineered innovative products that doubled operational capacity, enabling management of an additional 2 million square feet",
    "Conducted training sessions for up to 150 participants",
    "Partnered with operations, marketing, and other departments to align technology with company goals",
    "Managed the corporate strategic roadmap across multiple products and guided leadership on product and feature priorities",
    "Cultivated a growth-oriented culture by providing mentorship and career development opportunities",
    "Pivoted and extended products to allow Cenergistic to expand into new markets",
    "Managed the transition from in-house IT employees to a Managed Service Provider as head of the IT department"
  ),
)

#resume-role(
  company: "Cenergistic",
  location: "Dallas, TX",
  dates: "2018 -- 2022",
  title: "Director of Software Development",
  title-dates: "2018 -- 2021",
  bullets: (
    "Built and managed a new team of ten developers and QA within six months",
    "Developed and deployed a React Native app in eight months",
    "Created a Node.js service backend that successfully scaled to demand",
    "Developed data pipelines that ingested customer data and produced alerts that highlighted savings opportunities",
    "Shifted infrastructure from bare virtual machines to containerized applications hosted on AWS Elastic Container Service, reducing costs by 50%",
    "Reviewed developer code and provided constructive feedback to improve product quality",
    "Created a web scraping platform that scaled to hundreds of target sites per day, decreasing issue resolution time from months to minutes"
  ),
)

#resume-role(
  company: "Beck Technology",
  location: "Dallas, TX",
  dates: "2016 -- 2018",
  title: "Project Leader",
  bullets: (
    "Led and trained a team of two junior developers",
    "Implemented a cloud-based 3D model viewer into the flagship product",
    "Created a 3D model comparison tool to compare costs between multiple versions of a building design"
  ),
)

#resume-role(
  company: "Provider Science",
  location: "Dallas, TX",
  dates: "2015 -- 2016",
  title: "Senior Software Engineer",
  bullets: (
    "Designed and implemented a Decision Forest-based prediction system to determine optimal pharmacy staffing",
    "Engineered the ETL data flow from distributed sites that provided raw data to the prediction system",
    "Developed a drag-and-drop user experience that automated the ETL process for users"
  ),
)

#resume-role(
  company: "Gwynn Group",
  location: "Dallas, TX",
  dates: "2015 -- 2015",
  title: "Senior Software Engineer",
  bullets: (
    "Created a temporal exponential smoothing forecast engine that reduced false alarms by 20%",
    "Designed and implemented custom visualizations utilizing D3 to help clients understand large datasets"
  ),
)

#resume-role(
  company: "Allegro",
  location: "Dallas, TX",
  dates: "2013 -- 2015",
  title: "Software Engineer",
  bullets: (
    "Reengineered the legacy ad hoc build process using MSBuild and C#, resulting in a 4x speedup",
    "Integrated the standardized build process into the software development cycle, enabling more integration builds and greater product reliability",
    "Developed a new Business Intelligence Portal using C#, MVC5, and SQL Server"
  ),
)

#heading(1)[Technologies and Tools]
AWS, Typescript, React, GenAI, OpenAI, LLM, React Native, SQL, Python, Java, Docker, Terraform, JavaScript, Node.js, Express, Redis, Elasticsearch, Postman, Cypress, Puppeteer, .NET, C#, D3, Fastlane, TestFlight, Sentry, VSCode, GitHub, GitHub Actions, JIRA

#heading(1)[Education]
Computer Science, University of Texas, Austin, TX \hfill 2008 -- 2012
