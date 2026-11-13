export type UserRole = 'admin' | 'mentor' | 'student';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type QuizType = 'multiple_choice' | 'live_coding';

export interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface MentorLearningPath {
  mentor_id: string;
  learning_path_id: string;
  assigned_at: Date | string;
}

export interface Course {
  id: string;
  learning_path_id: string;
  created_by: string | null;
  title: string;
  slug: string;
  description: string | null;
  level: CourseLevel;
  is_published: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: Date | string;
  completed_at: Date | string | null;
}

export interface Chapter {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Material {
  id: string;
  chapter_id: string;
  title: string;
  content: string;
  has_playground: boolean;
  playground_language: string | null;
  playground_starter_code: string | null;
  order_index: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Quiz {
  id: string;
  chapter_id: string;
  title: string;
  description: string | null;
  quiz_type: QuizType;
  passing_score: number;
  order_index: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizTestCase {
  input: string;
  expected_output: string;
  is_hidden: boolean;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  points: number;
  order_index: number;
  options: QuizOption[] | null;
  correct_option_id: string | null;
  programming_language: string | null;
  starter_code: string | null;
  solution_code: string | null;
  test_cases: QuizTestCase[] | null;
  hints: string[];
}

export interface QuizSubmission {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  is_passed: boolean;
  submitted_answers: Record<string, unknown> | null;
  submitted_at: Date | string;
}

export interface UserMaterialProgress {
  id: string;
  user_id: string;
  material_id: string;
  is_completed: boolean;
  last_accessed_at: Date | string;
  completed_at: Date | string | null;
}

export interface Certificate {
  id: string;
  certificate_code: string;
  user_id: string;
  course_id: string;
  issued_at: Date | string;
}