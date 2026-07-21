-- Insert Sample Subjects
INSERT INTO public.subjects (id, name, code, year, semester, description, icon)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Computer Systems', 'IT1101', 1, 1, 'Introduction to computer architecture and systems.', 'Monitor'),
  ('22222222-2222-2222-2222-222222222222', 'Programming in C', 'IT1102', 1, 1, 'Fundamentals of C programming and logic.', 'Code'),
  ('33333333-3333-3333-3333-333333333333', 'Database Management Systems', 'IT1201', 1, 2, 'Relational databases, SQL, and database design.', 'Database'),
  ('44444444-4444-4444-4444-444444444444', 'Web Development', 'IT1202', 1, 2, 'HTML, CSS, JavaScript, and modern web frameworks.', 'Globe')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Labs
INSERT INTO public.labs (id, subject_id, title, description, difficulty, order_index, theory_content, practical_steps)
VALUES
  (
    'aaaa1111-1111-1111-1111-111111111111', 
    '11111111-1111-1111-1111-111111111111', 
    'Understanding the CPU', 
    'Learn about CPU architecture, registers, and the fetch-execute cycle.', 
    'beginner', 
    1,
    '{"content": "The Central Processing Unit (CPU) is the primary component of a computer that acts as its brain."}',
    '{"steps": ["Open the simulator", "Load the sample instruction set", "Observe the registers changing during the fetch cycle"]}'
  ),
  (
    'bbbb2222-2222-2222-2222-222222222222', 
    '22222222-2222-2222-2222-222222222222', 
    'Hello World in C', 
    'Write, compile, and run your very first C program.', 
    'beginner', 
    1,
    '{"content": "C is a powerful general-purpose programming language. It can be used to develop software like operating systems, databases, compilers, and so on."}',
    '{"steps": ["Write #include <stdio.h>", "Create the main function", "Use printf to print Hello World", "Compile using gcc"]}'
  ),
  (
    'cccc3333-3333-3333-3333-333333333333', 
    '33333333-3333-3333-3333-333333333333', 
    'SQL Select Queries', 
    'Learn how to retrieve data from a relational database using the SELECT statement.', 
    'intermediate', 
    1,
    '{"content": "The SELECT statement is used to select data from a database. The data returned is stored in a result table, called the result-set."}',
    '{"steps": ["Connect to the database", "Write a SELECT * query", "Add a WHERE clause to filter results"]}'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Questions for Labs
INSERT INTO public.questions (lab_id, subject_id, question_text, options, correct_answer, explanation, question_type, points)
VALUES
  (
    'aaaa1111-1111-1111-1111-111111111111', 
    '11111111-1111-1111-1111-111111111111',
    'Which component of the CPU is responsible for performing arithmetic and logic operations?',
    '["Control Unit", "ALU", "Registers", "Cache"]',
    'ALU',
    'The Arithmetic Logic Unit (ALU) performs all arithmetic and logical operations within the CPU.',
    'multiple_choice',
    10
  ),
  (
    'bbbb2222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'What is the correct syntax to print a message to the console in C?',
    '["echo(\"Hello\");", "System.out.println(\"Hello\");", "printf(\"Hello\");", "print(\"Hello\");"]',
    'printf("Hello");',
    'In C, the printf function is used to print output to the standard output stream.',
    'multiple_choice',
    10
  ),
  (
    'cccc3333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'Which SQL clause is used to filter records?',
    '["ORDER BY", "FILTER", "WHERE", "GROUP BY"]',
    'WHERE',
    'The WHERE clause is used to filter records that fulfill a specified condition.',
    'multiple_choice',
    10
  );
