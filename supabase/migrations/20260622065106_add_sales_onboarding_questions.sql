/*
# Add assessment questions for Sales Onboarding Training Programme

1. New Data
- Insert 52 questions across 5 assessments for the Sales Onboarding course
- Assessment 1: Phase 1 — Company & Products (11 questions)
- Assessment 2: Phase 2 — Customers & Market (10 questions)
- Assessment 3: Phase 3 — Competitive Positioning (11 questions)
- Assessment 4: Phase 4 — Sales Skills (10 questions)
- Assessment 5: Scenario-Based Final Assessment (10 questions)

2. Notes
- Questions use multiple_choice, true_false, fill_blank, matching, and short_answer types
- correct_answer stores the right answer for auto-graded questions
- matching_pairs stores JSON arrays for matching questions
- manual_grading is true for short_answer questions
*/

DO $$
DECLARE
  a1 uuid; -- Phase 1 Assessment
  a2 uuid; -- Phase 2 Assessment
  a3 uuid; -- Phase 3 Assessment
  a4 uuid; -- Phase 4 Assessment
  a5 uuid; -- Final Assessment
BEGIN
  SELECT id INTO a1 FROM assessments WHERE title = 'Phase 1 Assessment — Company & Products';
  SELECT id INTO a2 FROM assessments WHERE title = 'Phase 2 Assessment — Customers & Market';
  SELECT id INTO a3 FROM assessments WHERE title = 'Phase 3 Assessment — Competitive Positioning';
  SELECT id INTO a4 FROM assessments WHERE title = 'Phase 4 Assessment — Sales Skills';
  SELECT id INTO a5 FROM assessments WHERE title = 'Scenario-Based Final Assessment';

  -- Assessment 1: Phase 1 — Company & Products (11 questions)
  INSERT INTO questions (assessment_id, type, question_text, options, correct_answer, matching_pairs, manual_grading, order_index) VALUES
  (a1, 'multiple_choice', 'What best describes Leapswitch?', '["CRM Software Provider", "Infrastructure & Cloud Services Provider", "Digital Marketing Agency", "ERP Software Company"]'::jsonb, 'Infrastructure & Cloud Services Provider', NULL, false, 0),
  (a1, 'true_false', 'CloudJiffy allows developers to focus on applications instead of managing infrastructure.', NULL, 'true', NULL, false, 1),
  (a1, 'multiple_choice', 'A customer says: "We need complete control over our infrastructure and dedicated resources for high-performance applications." Which solution would be most suitable?', '["CloudJiffy", "Bare Metal Servers", "SSL Certificates", "Backup Services"]'::jsonb, 'Bare Metal Servers', NULL, false, 2),
  (a1, 'matching', 'Match the customer requirement to the best solution.', NULL, NULL, '[{"left":"AI & Machine Learning Workloads", "right":"GPU Cloud"}, {"left":"Fast Application Deployment", "right":"CloudJiffy"}, {"left":"Dedicated Infrastructure", "right":"Bare Metal Servers"}, {"left":"Flexible Cloud Resources", "right":"CloudPe Virtual Machines"}]'::jsonb, false, 3),
  (a1, 'multiple_choice', 'Which customer segment is most likely to require GPU infrastructure?', '["Web Agencies", "AI & Machine Learning Companies", "Reseller Hosting Customers", "Small Retail Stores"]'::jsonb, 'AI & Machine Learning Companies', NULL, false, 4),
  (a1, 'multiple_choice', 'Which stakeholder is primarily responsible for technology strategy and scalability decisions?', '["Finance Team", "CEO", "CTO", "Procurement Team"]'::jsonb, 'CTO', NULL, false, 5),
  (a1, 'true_false', 'Leapswitch primarily focuses on providing infrastructure and cloud services rather than ERP software.', NULL, 'true', NULL, false, 6),
  (a1, 'matching', 'Match the stakeholder to their primary focus.', NULL, NULL, '[{"left":"CEO / Founder", "right":"Business Growth"}, {"left":"CTO", "right":"Scalability & Technology"}, {"left":"CIO", "right":"Security & Compliance"}, {"left":"Finance Team", "right":"Budget & Cost Control"}]'::jsonb, false, 7),
  (a1, 'multiple_choice', 'A prospect says: "We are launching a new AI application and need infrastructure for model training." Which solution would be most relevant?', '["SSL Certificates", "Backup Services", "GPU Cloud", "Email Hosting"]'::jsonb, 'GPU Cloud', NULL, false, 8),
  (a1, 'multiple_choice', 'Which of the following are common signs of a qualified sales opportunity?', '["Clear requirements", "Defined timeline", "Budget discussion", "All of the above"]'::jsonb, 'All of the above', NULL, false, 9),
  (a1, 'multiple_choice', 'A prospect says: "We are evaluating multiple providers and need a solution that meets compliance requirements." Which stakeholder is most likely to be heavily involved in the decision?', '["Marketing Manager", "CIO", "Graphic Designer", "Sales Executive"]'::jsonb, 'CIO', NULL, false, 10)
  ON CONFLICT DO NOTHING;

  -- Assessment 2: Phase 2 — Customers & Market (10 questions)
  INSERT INTO questions (assessment_id, type, question_text, options, correct_answer, matching_pairs, manual_grading, order_index) VALUES
  (a2, 'multiple_choice', 'Which of the following is a characteristic of a qualified sales opportunity?', '["No defined requirement", "No identified stakeholders", "Clear requirements and business need", "No timeline for implementation"]'::jsonb, 'Clear requirements and business need', NULL, false, 0),
  (a2, 'multiple_choice', 'Which stakeholder is most likely to focus on return on investment (ROI) and budget planning?', '["CTO", "CIO", "Finance Team", "IT Team"]'::jsonb, 'Finance Team', NULL, false, 1),
  (a2, 'true_false', 'Infrastructure purchasing decisions are often made by multiple stakeholders rather than a single person.', NULL, 'true', NULL, false, 2),
  (a2, 'matching', 'Match the pain point to its category.', NULL, NULL, '[{"left":"Rising cloud costs", "right":"Cost & Billing Challenges"}, {"left":"Slow support response", "right":"Support & Operational Challenges"}, {"left":"Difficulty handling growth", "right":"Performance & Scalability Challenges"}, {"left":"Compliance requirements", "right":"Security & Compliance Challenges"}]'::jsonb, false, 3),
  (a2, 'multiple_choice', 'Which of the following is a common buying trigger?', '["Business expansion", "Cloud migration", "AI adoption", "All of the above"]'::jsonb, 'All of the above', NULL, false, 4),
  (a2, 'multiple_choice', 'A prospect says: "Our current provider''s support team takes too long to resolve issues." What is the primary pain point?', '["Compliance", "Performance", "Support & Operational Challenges", "AI Infrastructure"]'::jsonb, 'Support & Operational Challenges', NULL, false, 5),
  (a2, 'true_false', 'A customer with a defined budget, clear requirements, and an urgent timeline is more likely to be a qualified opportunity.', NULL, 'true', NULL, false, 6),
  (a2, 'matching', 'Match the situation to the buying trigger.', NULL, NULL, '[{"left":"Launching a new product", "right":"Growth & Expansion"}, {"left":"Reducing infrastructure expenses", "right":"Cost Optimization"}, {"left":"Replacing legacy systems", "right":"Technology Modernization"}, {"left":"Deploying AI workloads", "right":"AI & Innovation"}]'::jsonb, false, 7),
  (a2, 'multiple_choice', 'Which industry is most likely to prioritize security, compliance, and governance requirements?', '["FinTech", "Gaming", "Travel", "Digital Marketing"]'::jsonb, 'FinTech', NULL, false, 8),
  (a2, 'multiple_choice', 'A prospect is evaluating multiple providers, has approved budget, involved stakeholders, and wants deployment within 30 days. What does this most likely indicate?', '["General inquiry", "Qualified Sales Opportunity", "Customer support request", "Market research only"]'::jsonb, 'Qualified Sales Opportunity', NULL, false, 9)
  ON CONFLICT DO NOTHING;

  -- Assessment 3: Phase 3 — Competitive Positioning (11 questions)
  INSERT INTO questions (assessment_id, type, question_text, options, correct_answer, matching_pairs, manual_grading, order_index) VALUES
  (a3, 'multiple_choice', 'What is the primary goal of value-based selling?', '["Explain as many features as possible", "Focus on customer outcomes and business value", "Discuss technical specifications only", "Compare competitors"]'::jsonb, 'Focus on customer outcomes and business value', NULL, false, 0),
  (a3, 'matching', 'Match the sales term to its definition.', NULL, NULL, '[{"left":"Feature", "right":"Product capability"}, {"left":"Benefit", "right":"Customer advantage"}, {"left":"Business Value", "right":"Business outcome"}, {"left":"Solution Positioning", "right":"Connecting solutions to customer needs"}]'::jsonb, false, 1),
  (a3, 'multiple_choice', 'A customer says: "We need to train AI models faster." Which response best focuses on business value?', '["Our platform provides GPU infrastructure.", "We use advanced hardware.", "Our GPU infrastructure can help reduce training time and accelerate AI development.", "We have multiple server options."]'::jsonb, 'Our GPU infrastructure can help reduce training time and accelerate AI development.', NULL, false, 2),
  (a3, 'true_false', 'The sales process ends immediately after a customer makes payment.', NULL, 'false', NULL, false, 3),
  (a3, 'multiple_choice', 'Which team primarily supports technical solution design and architecture discussions?', '["Marketing", "Customer Success", "Presales", "Finance"]'::jsonb, 'Presales', NULL, false, 4),
  (a3, 'matching', 'Match the sales stage to its activity.', NULL, NULL, '[{"left":"Lead Generation", "right":"Identifying potential customers"}, {"left":"Discovery", "right":"Understanding customer requirements"}, {"left":"Solution Design", "right":"Recommending suitable solutions"}, {"left":"Customer Onboarding", "right":"Activating and supporting customers"}]'::jsonb, false, 5),
  (a3, 'multiple_choice', 'Why do customers typically compare multiple providers?', '["To evaluate pricing and support", "To assess solution fit", "To compare business value", "All of the above"]'::jsonb, 'All of the above', NULL, false, 6),
  (a3, 'multiple_choice', 'A customer asks: "How is CloudPe different from AWS?" What should be the first step?', '["Criticize AWS", "Understand the customer''s requirements and priorities", "Focus only on pricing", "Avoid the comparison"]'::jsonb, 'Understand the customer''s requirements and priorities', NULL, false, 7),
  (a3, 'true_false', 'Objections are always a sign that the customer is not interested.', NULL, 'false', NULL, false, 8),
  (a3, 'multiple_choice', 'According to the LACE objection handling framework, what should happen after acknowledging the customer''s concern?', '["Explain immediately", "Clarify the concern", "End the discussion", "Provide pricing"]'::jsonb, 'Clarify the concern', NULL, false, 9),
  (a3, 'multiple_choice', 'A prospect says: "Migration sounds risky and we are worried about downtime." Which category of objection is this?', '["Pricing Objection", "Trust Objection", "Migration Objection", "Support Objection"]'::jsonb, 'Migration Objection', NULL, false, 10)
  ON CONFLICT DO NOTHING;

  -- Assessment 4: Phase 4 — Sales Skills (10 questions)
  INSERT INTO questions (assessment_id, type, question_text, options, correct_answer, matching_pairs, manual_grading, order_index) VALUES
  (a4, 'multiple_choice', 'Which stage comes immediately after a customer approves the proposed solution?', '["Lead Generation", "Discovery", "Customer Activation & Onboarding", "Qualification"]'::jsonb, 'Customer Activation & Onboarding', NULL, false, 0),
  (a4, 'true_false', 'The primary goal of discovery is to immediately pitch the product to the customer.', NULL, 'false', NULL, false, 1),
  (a4, 'multiple_choice', 'Which of the following is NOT a common lead source?', '["LinkedIn Outreach", "Referrals", "Website Inquiries", "Customer Technical Support Tickets"]'::jsonb, 'Customer Technical Support Tickets', NULL, false, 2),
  (a4, 'matching', 'Match the support level to its responsibility.', NULL, NULL, '[{"left":"L1", "right":"Basic issues and first-level support"}, {"left":"L2", "right":"Intermediate technical issues"}, {"left":"L3", "right":"Advanced technical issues and escalations"}]'::jsonb, false, 3),
  (a4, 'short_answer', 'What does BANT stand for in sales qualification?', NULL, 'Budget, Authority, Need, Timeline', NULL, true, 4),
  (a4, 'multiple_choice', 'A prospect says: "We are planning to move away from our current provider because support response times are slow." Which discovery area does this statement help uncover?', '["Current Environment", "Challenges", "Future Plans", "Budget"]'::jsonb, 'Challenges', NULL, false, 5),
  (a4, 'multiple_choice', 'According to the LACE Framework, what should a salesperson do immediately after listening to a customer''s concern?', '["Explain the solution", "Clarify the issue", "Acknowledge the concern", "Offer a discount"]'::jsonb, 'Acknowledge the concern', NULL, false, 6),
  (a4, 'fill_blank', 'Customers rarely choose a provider based on ________ alone. Factors such as support, reliability, flexibility, and trust also influence decisions.', NULL, 'price', NULL, false, 7),
  (a4, 'short_answer', 'Convert the following feature into a business value statement: "Predictable Pricing"', NULL, 'Predictable pricing helps customers manage budgets more effectively and reduces unexpected cloud expenses.', NULL, true, 8),
  (a4, 'multiple_choice', 'A customer says: "Your pricing seems higher than another provider." Using the LACE Framework, what should be your first response?', '["Offer a discount immediately", "Explain all product features", "Ask for the competitor''s quote", "Acknowledge the concern and understand the reason behind it"]'::jsonb, 'Acknowledge the concern and understand the reason behind it', NULL, false, 9)
  ON CONFLICT DO NOTHING;

  -- Assessment 5: Scenario-Based Final Assessment (10 questions)
  INSERT INTO questions (assessment_id, type, question_text, options, correct_answer, matching_pairs, manual_grading, order_index) VALUES
  (a5, 'multiple_choice', 'A prospect says: "Our AWS bills keep increasing every month, and we find it difficult to predict our cloud costs." What is the customer''s primary pain point?', '["Security concerns", "Cost predictability", "Compliance requirements", "Performance issues"]'::jsonb, 'Cost predictability', NULL, false, 0),
  (a5, 'multiple_choice', 'A customer wants to train machine learning models and is looking for high-performance computing resources. Which solution would be most appropriate?', '["Shared Hosting", "Reseller Hosting", "GPU Cloud", "Email Hosting"]'::jsonb, 'GPU Cloud', NULL, false, 1),
  (a5, 'multiple_choice', 'A prospect says: "We need infrastructure that meets compliance and governance requirements." Which customer segment is this most likely to belong to?', '["Startup", "E-commerce Business", "Enterprise Organization", "Web Agency"]'::jsonb, 'Enterprise Organization', NULL, false, 2),
  (a5, 'multiple_choice', 'A customer is launching a new application and expects rapid growth over the next year. Which customer need is most important?', '["Scalability", "Email Hosting", "Domain Registration", "Shared Hosting"]'::jsonb, 'Scalability', NULL, false, 3),
  (a5, 'multiple_choice', 'A customer says: "We are happy with our current provider, but support response times are becoming a problem." What buying trigger can you identify?', '["Business Expansion", "Poor Support Experience", "Compliance Requirement", "AI Initiative"]'::jsonb, 'Poor Support Experience', NULL, false, 4),
  (a5, 'multiple_choice', 'A prospect asks: "Why should I consider CloudPe instead of AWS?" What should your response focus on?', '["Criticizing AWS", "Discussing customer requirements and relevant differentiators", "Claiming AWS is unreliable", "Focusing only on price"]'::jsonb, 'Discussing customer requirements and relevant differentiators', NULL, false, 5),
  (a5, 'multiple_choice', 'A hosting provider wants reliable infrastructure that can be used to serve its own customers. Which Leapswitch customer category best fits this scenario?', '["Enterprise Customer", "AI Startup", "Infrastructure Partner / Hoster", "E-commerce Business"]'::jsonb, 'Infrastructure Partner / Hoster', NULL, false, 6),
  (a5, 'multiple_choice', 'A customer says: "We are planning to migrate from our current provider but are concerned about downtime." What type of objection is this?', '["Pricing Objection", "Trust Objection", "Migration Objection", "Support Objection"]'::jsonb, 'Migration Objection', NULL, false, 7),
  (a5, 'multiple_choice', 'A customer asks: "Can your infrastructure scale as our business grows?" Which stakeholder is most likely asking this question?', '["CTO", "Finance Team", "Procurement Team", "Billing Team"]'::jsonb, 'CTO', NULL, false, 8),
  (a5, 'multiple_choice', 'A prospect has a clearly defined requirement, a confirmed budget, and wants implementation within two weeks. What does this indicate?', '["General Inquiry", "Early Research Stage", "Qualified Opportunity with Strong Buying Intent", "Support Request"]'::jsonb, 'Qualified Opportunity with Strong Buying Intent', NULL, false, 9)
  ON CONFLICT DO NOTHING;

END $$;
