import { Activity } from './types';

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: '1',
    title: '텐서플로우 이미지 분류기',
    description: '파이썬과 TensorFlow를 활용하여 강아지와 고양이를 구분하는 인공지능 모델을 제작했습니다.',
    category: 'AI-Model',
    tags: ['Python', 'DeepLearning', 'TensorFlow'],
    link: 'https://github.com/tensorflow/tensorflow',
    addedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: '아두이노 스마트 홈 시스템',
    description: '아두이노와 각종 센서를 활용하여 음성으로 제어하는 스마트 홈 프로토타입을 개발했습니다.',
    category: 'Arduino',
    tags: ['Arduino', 'C++', 'IoT'],
    addedAt: new Date().toISOString(),
  }
];

export const CATEGORIES: { name: string; icon: string; label: string }[] = [
  { name: 'All', icon: 'LayoutGrid', label: '전체 활동' },
  { name: 'Python', icon: 'Code', label: '파이썬' },
  { name: 'Arduino', icon: 'Cpu', label: '아두이노' },
  { name: 'AI-Model', icon: 'Brain', label: '인공지능 모델' },
  { name: 'Project', icon: 'Folder', label: '프로젝트' },
];
