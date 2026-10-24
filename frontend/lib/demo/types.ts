export type DemoRole='guest'|'member'|'teacher'|'moderator'|'admin';
export type DemoAccountStatus='active'|'suspended'|'deactivated'|'deletion_pending';

export type DemoTopic={
  id:string;
  name:string;
  description:string;
  questionCount:number;
  slug:string;
  archived?:boolean;
};

export type DemoAuthor={
  id:string;
  label:string;
  isAnonymous?:boolean;
  isQuestionAuthor?:boolean;
  isTeacher?:boolean;
  title?:string;
  church?:string;
  bio?:string;
  joined?:string;
  avatar?:string;
};

export type DemoComment={
  id:string;
  body:string;
  author:DemoAuthor;
  createdAt:string;
  replyTo?:string;
};

export type DemoAnswer={
  id:string;
  questionId:string;
  body:string;
  author:DemoAuthor;
  createdAt:string;
  helpful:number;
  references?:string[];
  comments:DemoComment[];
  edited?:boolean;
  /** Private demo ownership key — never shown publicly */
  ownerKey?:string;
};

export type DemoQuestion={
  id:string;
  title:string;
  body:string;
  topicIds:string[];
  author:DemoAuthor;
  createdAt:string;
  relative:string;
  upvotes:number;
  views:number;
  isAnonymous:boolean;
  /** Private demo ownership — not rendered in UI */
  ownerKey?:string;
  acceptedAnswerId?:string|null;
  edited?:boolean;
  image?:{src:string;alt:string;caption?:string};
  status?:'published'|'removed'|'deleted';
};

export type DemoNotification={
  id:string;
  title:string;
  body:string;
  createdAt:string;
  read:boolean;
  important?:boolean;
  href?:string;
};

export type DemoReport={
  id:string;
  contentType:'Question'|'Answer'|'Comment';
  snippet:string;
  reason:string;
  status:'open'|'review'|'resolved';
  reports:number;
  createdAt:string;
  authorLabel:string;
  questionId?:string;
};

export type DemoTeacherApplication={
  id:string;
  name:string;
  role:string;
  institution:string;
  status:'pending'|'review'|'approved'|'declined'|'revoked';
  submittedAt:string;
  note?:string;
  /** Private — never shown on public profile */
  evidenceNote?:string;
};

export type DemoAppeal={
  id:string;
  decisionType:'moderation'|'teacher';
  decisionId:string;
  explanation:string;
  status:'pending'|'in_review'|'approved'|'rejected';
  createdAt:string;
  deadline:string;
};

export type DemoSession={
  signedIn:boolean;
  email:string;
  displayName:string;
  emailVerified:boolean;
  role:DemoRole;
  accountStatus:DemoAccountStatus;
  bio:string;
  language:'en'|'am';
  theme:'light'|'dark'|'system';
  notifyAnswers:boolean;
  notifyReplies:boolean;
  notifyVerification:boolean;
  /** Opaque demo member key for ownership checks */
  memberKey:string;
  deletionExplained?:boolean;
};

export type DemoState={
  session:DemoSession;
  topics:DemoTopic[];
  followedTopicIds:string[];
  questions:DemoQuestion[];
  answers:DemoAnswer[];
  savedQuestionIds:string[];
  followedQuestionIds:string[];
  upvotedQuestionIds:string[];
  helpfulAnswerIds:string[];
  notifications:DemoNotification[];
  reports:DemoReport[];
  teacherApplications:DemoTeacherApplication[];
  appeals:DemoAppeal[];
  audit: {user:string;action:string;details:string;date:string}[];
  banner:string;
  /** Development-only: never treat as production auth */
  demoRoleSwitchEnabled:true;
};
