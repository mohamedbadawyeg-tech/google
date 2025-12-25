
import React from 'react';
import { Medication, TimeSlot } from './types';
import { Sun, Coffee, Utensils, CloudSun, Clock, Moon, Bed } from 'lucide-react';

export const MEDICATIONS: Medication[] = [
  { id: 'examide', name: 'Examide 20 mg', dosage: 'قرص واحد', timeSlot: 'morning-fasting', notes: 'مدر للبول - على معدة فارغة', isCritical: false, frequencyLabel: '7:00 صباحاً', category: 'other' },
  { id: 'norvasc', name: 'Norvasc 10 mg', dosage: 'قرص واحد', timeSlot: 'morning-fasting', notes: 'لضغط الدم', isCritical: false, frequencyLabel: '7:00 صباحاً', category: 'pressure' },
  { id: 'contorloc', name: 'Contorloc 40 mg', dosage: 'قرص واحد', timeSlot: 'morning-fasting', notes: 'لحموضة المعدة', isCritical: false, frequencyLabel: '7:00 صباحاً', category: 'stomach' },
  { id: 'corvid', name: 'Corvid 6.25 mg', dosage: 'نصف قرص', timeSlot: 'morning-fasting', notes: 'لضغط الدم والقلب', isCritical: false, frequencyLabel: '7:00 صباحاً', category: 'pressure' },
  { id: 'aldomet-1', name: 'Aldomet 250 mg', dosage: 'قرصين', timeSlot: 'after-breakfast', notes: 'الجرعة الأولى (كل 8 ساعات)', isCritical: false, frequencyLabel: '9:00 صباحاً', category: 'pressure' },
  { id: 'eliquis-1', name: 'Eliquis 2.5 mg', dosage: 'قرص واحد', timeSlot: 'after-breakfast', notes: 'مميع للدم - خطر نزيف', isCritical: true, frequencyLabel: '9:00 صباحاً', category: 'blood-thinner' },
  { id: 'acetyl-1', name: 'Acetyl Cysteine', dosage: 'كيس واحد', timeSlot: 'after-breakfast', notes: 'مذيب للبلغم', isCritical: false, frequencyLabel: '9:00 صباحاً', category: 'other' },
  { id: 'forxiga', name: 'Forxiga 10 mg', dosage: 'قرص واحد', timeSlot: 'before-lunch', notes: 'للسكري - اشرب مياه كافية', isCritical: false, frequencyLabel: '1:00 ظهراً', category: 'diabetes' },
  { id: 'suprax', name: 'Suprax 200 mg', dosage: 'قرص واحد', timeSlot: 'after-lunch', notes: 'مضاد حيوي', isCritical: false, frequencyLabel: '3:00 عصراً', category: 'antibiotic' },
  { id: 'suprax-susp', name: 'Suprax Suspension', dosage: '3 سم', timeSlot: 'after-lunch', notes: 'مضاد حيوي سائل', isCritical: false, frequencyLabel: '3:00 عصراً', category: 'antibiotic' },
  { id: 'eraloner', name: 'Eraloner 25 mg', dosage: 'قرص واحد', timeSlot: 'afternoon', notes: 'مضاد للاكتئاب/القلق', isCritical: false, frequencyLabel: '5:00 عصراً', category: 'other' },
  { id: 'aldomet-2', name: 'Aldomet 250 mg', dosage: 'قرصين', timeSlot: 'afternoon', notes: 'الجرعة الثانية (بعد 8 ساعات)', isCritical: false, frequencyLabel: '5:00 عصراً', category: 'pressure' },
  { id: 'cardura', name: 'Cardura 4 mg', dosage: 'قرص واحد', timeSlot: '6pm', notes: 'لضغط الدم', isCritical: false, frequencyLabel: '6:00 مساءً', category: 'pressure' },
  { id: 'plavix', name: 'Plavix 75 mg', dosage: 'قرص واحد', timeSlot: 'after-dinner', notes: 'مميع للدم - خطر نزيف عالي', isCritical: true, frequencyLabel: '8:00 مساءً', category: 'blood-thinner' },
  { id: 'lipitor', name: 'Lipitor 40 mg', dosage: 'قرص واحد', timeSlot: 'after-dinner', notes: 'للكوليسترول', isCritical: false, frequencyLabel: '8:00 مساءً', category: 'other' },
  { id: 'moxiflox', name: 'Moxiflox', dosage: 'قرص واحد', timeSlot: 'after-dinner', notes: 'مضاد حيوي - بعيد عن اللبن', isCritical: false, frequencyLabel: '8:00 مساءً', category: 'antibiotic' },
  { id: 'spiriva', name: 'Spiriva 18 mcg', dosage: 'بخة واحدة', timeSlot: 'after-dinner', notes: 'بخاخة استنشاق', isCritical: false, frequencyLabel: '8:00 مساءً', category: 'other' },
  { id: 'eliquis-2', name: 'Eliquis 2.5 mg', dosage: 'قرص واحد', timeSlot: 'before-bed', notes: 'الجرعة المسائية', isCritical: true, frequencyLabel: '10:00 مساءً', category: 'blood-thinner' },
  { id: 'aldomet-3', name: 'Aldomet 250 mg', dosage: 'قرصين', timeSlot: 'before-bed', notes: 'الجرعة الثالثة والأخيرة', isCritical: false, frequencyLabel: '10:00 مساءً', category: 'pressure' },
  { id: 'acetyl-2', name: 'Acetyl Cysteine', dosage: 'كيس واحد', timeSlot: 'before-bed', notes: 'الجرعة المسائية', isCritical: false, frequencyLabel: '10:00 مساءً', category: 'other' },
];

export const CATEGORY_COLORS: Record<string, string> = {
  'pressure': 'text-blue-600',
  'diabetes': 'text-green-600',
  'blood-thinner': 'text-red-600',
  'antibiotic': 'text-purple-600',
  'stomach': 'text-orange-600',
  'other': 'text-slate-600'
};

// Map slots to 24h hours for reminders
export const SLOT_HOURS: Record<TimeSlot, number> = {
  'morning-fasting': 7,
  'after-breakfast': 9,
  'before-lunch': 13,
  'after-lunch': 15,
  'afternoon': 17,
  '6pm': 18,
  'after-dinner': 20,
  'before-bed': 22,
};

export const TIME_SLOT_CONFIG: Record<TimeSlot, { label: string, icon: React.ReactNode, color: string }> = {
  'morning-fasting': { label: 'الصباح على الريق', icon: <Sun className="w-5 h-5" />, color: 'bg-yellow-50 border-yellow-200' },
  'after-breakfast': { label: 'بعد الفطار', icon: <Coffee className="w-5 h-5" />, color: 'bg-orange-50 border-orange-200' },
  'before-lunch': { label: 'قبل الغداء', icon: <Utensils className="w-5 h-5" />, color: 'bg-green-50 border-green-200' },
  'after-lunch': { label: 'بعد الغداء', icon: <Utensils className="w-5 h-5" />, color: 'bg-blue-50 border-blue-200' },
  'afternoon': { label: 'العصر', icon: <CloudSun className="w-5 h-5" />, color: 'bg-indigo-50 border-indigo-200' },
  '6pm': { label: 'الساعة 6 مساءً', icon: <Clock className="w-5 h-5" />, color: 'bg-purple-50 border-purple-200' },
  'after-dinner': { label: 'بعد العشاء', icon: <Moon className="w-5 h-5" />, color: 'bg-slate-50 border-slate-200' },
  'before-bed': { label: 'قبل النوم', icon: <Bed className="w-5 h-5" />, color: 'bg-cyan-50 border-cyan-200' },
};

export const SYMPTOMS = [
  'صداع', 'دوخة', 'غثيان', 'تعب عام', 'ضيق تنفس', 'آلام صدر', 'كحة', 'وجع مفاصل', 'زغللة عين'
];
