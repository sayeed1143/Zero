import { faker } from '@faker-js/faker';

export type Message = {
  id: string;
  sender: {
    name: string;
    avatar: string;
    isUser?: boolean;
  };
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  file?: {
    name: string;
    size: string;
  };
  image?: string;
};

export type Conversation = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
};

export const loggedInUser = {
  name: 'You',
  avatar: faker.image.avatar(),
  isUser: true,
};

const generateConversations = (count: number): Conversation[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    avatar: faker.image.avatar(),
    lastMessage: faker.lorem.sentence(),
    lastMessageTime: faker.date.recent({ days: 1 }).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    unreadCount: faker.helpers.arrayElement([undefined, faker.number.int({ min: 1, max: 5 })]),
  }));
};

export const conversations = generateConversations(10);

export const messages: Message[] = [
  {
    id: faker.string.uuid(),
    sender: { name: conversations[0].name, avatar: conversations[0].avatar },
    text: 'Hey! I was wondering if you had any updates on the project proposal.',
    timestamp: '10:30 AM',
    type: 'text',
  },
  {
    id: faker.string.uuid(),
    sender: loggedInUser,
    text: 'Hi! Yes, I just finished the final draft.',
    timestamp: '10:31 AM',
    type: 'text',
  },
  {
    id: faker.string.uuid(),
    sender: loggedInUser,
    text: 'I\'ve attached it below.',
    timestamp: '10:31 AM',
    type: 'text',
  },
  {
    id: faker.string.uuid(),
    sender: loggedInUser,
    text: '',
    timestamp: '10:31 AM',
    type: 'file',
    file: {
      name: 'Project_Proposal_v3.pdf',
      size: '1.2 MB',
    },
  },
  {
    id: faker.string.uuid(),
    sender: { name: conversations[0].name, avatar: conversations[0].avatar },
    text: 'Awesome, thanks! I\'ll review it now.',
    timestamp: '10:32 AM',
    type: 'text',
  },
  {
    id: faker.string.uuid(),
    sender: { name: conversations[0].name, avatar: conversations[0].avatar },
    text: 'Also, here is the moodboard we discussed.',
    timestamp: '10:32 AM',
    type: 'text',
  },
    {
    id: faker.string.uuid(),
    sender: { name: conversations[0].name, avatar: conversations[0].avatar },
    text: 'Moodboard',
    timestamp: '10:32 AM',
    type: 'image',
    image: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x300.png?text=Moodboard'
  },
  {
    id: faker.string.uuid(),
    sender: loggedInUser,
    text: 'Looks great! This gives me a clear direction for the design. I\'ll get started on the mockups.',
    timestamp: '10:35 AM',
    type: 'text',
  },
  {
    id: faker.string.uuid(),
    sender: loggedInUser,
    text: 'Should have something for you by EOD.',
    timestamp: '10:35 AM',
    type: 'text',
  },
];
