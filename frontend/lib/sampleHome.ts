/** Local presentation extras for homepage fidelity to the attached approved mock. Not live votes, saves, or teacher records. */
export type SampleCard={
  asker:string;
  relative:string;
  votes:number;
  answersLabel:number;
  topicLabel?:string;
  preview?:{name:string;badge:string;snippet:string;helpful?:number;avatar?:string};
  image?:{src:string;alt:string};
};

export const sampleByTitle:Record<string,SampleCard>={
  'How can I build a daily prayer habit?':{
    asker:'Meron',
    relative:'2 hours ago',
    votes:42,
    answersLabel:8,
    topicLabel:'Prayer',
    preview:{
      name:'Abba Yohannes',
      badge:'Verified teacher',
      snippet:'Begin with a short, consistent time of prayer each day. A simple routine can help you stay attentive, even when life is busy. You might start with the morning and…',
      helpful:42,
      avatar:'/assets/sample-teacher-avatar.png',
    },
  },
  'What does this church artwork represent?':{
    asker:'Elenai',
    relative:'4 hours ago',
    votes:28,
    answersLabel:12,
    topicLabel:'Church Tradition',
    image:{
      src:'/assets/sample-church-artwork.png',
      alt:'Sample layout thumbnail from the approved homepage mock — local preview only',
    },
  },
  'Where should I begin reading the Bible?':{
    asker:'Hanna',
    relative:'1 day ago',
    votes:15,
    answersLabel:6,
    topicLabel:'Scripture',
  },
};

/** Mock-ordered titles for Trending presentation (not live ranking). */
export const trendingTitleOrder=[
  'How can I build a daily prayer habit?',
  'What does this church artwork represent?',
  'Where should I begin reading the Bible?',
];

export const sampleInsightQuestions=[
  {title:'How do I explain our fasting practice to friends?',asker:'Yonas',relative:'3 hours ago'},
  {title:'What prayers are said before meals at home?',asker:'Sara',relative:'6 hours ago'},
];
