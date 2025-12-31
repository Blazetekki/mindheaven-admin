'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon, TrashIcon,
  VideoCameraIcon, DocumentTextIcon, ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function LessonBuilderPage() {
  const router = useRouter();
  const params = useParams();
  // Ensure IDs are strings
  const moduleId = Array.isArray(params.id) ? params.id[0] : params.id;
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId;

  const [lesson, setLesson] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Step Form State
  const [stepType, setStepType] = useState<'text' | 'video' | 'reflection'>('text');
  const [stepContent, setStepContent] = useState('');
  const [promptQuestion, setPromptQuestion] = useState('');
  const [adding, setAdding] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);

    // Get Lesson Info
    const { data: lData } = await supabase.from('Lesson').select('*').eq('id', lessonId).single();
    if (lData) setLesson(lData);

    // Get Lesson Steps (Ordered)
    const { data: sData } = await supabase
      .from('LessonStep')
      .select('*')
      .eq('lessonId', lessonId)
      .order('order', { ascending: true });

    setSteps(sData || []);
    setLoading(false);
  };

  useEffect(() => {
    if (lessonId) fetchData();
  }, [lessonId]);

  // Add Step Logic
  const handleAddStep = async () => {
    if (!stepContent) return toast.error('Content is required');
    setAdding(true);
    const toastId = toast.loading('Adding step...');

    try {
      const nextOrder = steps.length + 1;

      const { data, error } = await supabase.from('LessonStep').insert({
        "lessonId": lessonId,
        "order": nextOrder,
        type: stepType,
        content: stepContent,
        "promptQuestion": stepType === 'reflection' ? promptQuestion : null
      }).select();

      if (error) throw error;

      setSteps([...steps, data[0]]);
      toast.success('Step added!', { id: toastId });

      // Reset Form
      setStepContent('');
      setPromptQuestion('');
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setAdding(false);
    }
  };

  // Delete Step
  const handleDeleteStep = async (id: string) => {
    const { error } = await supabase.from('LessonStep').delete().eq('id', id);
    if (!error) {
      setSteps(prev => prev.filter(s => s.id !== id));
      toast.success('Step removed');
    }
  };

  if (loading) return <div className="p-10 text-center text-teal-600 animate-pulse">Loading Builder...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Lesson List
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{lesson?.title}</h1>
        <p className="text-gray-500 text-sm">Build your lesson content block by block.</p>
      </div>

      {/* Steps List (Preview) */}
      <div className="space-y-6 mb-12">
        {steps.map((step, idx) => (
          <div key={step.id} className="relative group bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

            {/* Step Badge */}
            <div className="absolute -left-3 -top-3 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
              {idx + 1}
            </div>

            {/* Delete Button */}
            <button
              onClick={() => handleDeleteStep(step.id)}
              className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <TrashIcon className="w-5 h-5" />
            </button>

            {/* CONTENT RENDERER */}
            {step.type === 'text' && (
              <div className="flex gap-4">
                <DocumentTextIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{step.content}</p>
              </div>
            )}

            {step.type === 'video' && (
              <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-2">
                    <VideoCameraIcon className="w-5 h-5" /> Video Block
                 </div>
                 <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-600 break-all">
                    {step.content}
                 </div>
              </div>
            )}

            {step.type === 'reflection' && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                 <div className="flex items-center gap-2 text-purple-700 font-bold mb-2">
                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5" /> Reflection
                 </div>
                 <p className="text-gray-900 font-medium mb-2">{step.content}</p>
                 <div className="bg-white p-3 rounded border border-purple-200 text-gray-400 text-sm italic">
                    {step.promptQuestion || "User response area..."}
                 </div>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* ADD NEW BLOCK FORM */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">Add Content Block</h3>

        {/* Type Selector */}
        <div className="flex gap-4 mb-4">
            {['text', 'video', 'reflection'].map((t) => (
                <button
                    key={t}
                    onClick={() => setStepType(t as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                        stepType === t ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                    {t}
                </button>
            ))}
        </div>

        {/* Inputs */}
        <div className="space-y-4">
            {stepType === 'text' && (
                <textarea
                    rows={4}
                    placeholder="Type lesson content here..."
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-teal-500 outline-none"
                    value={stepContent}
                    onChange={(e) => setStepContent(e.target.value)}
                />
            )}

            {stepType === 'video' && (
                <input
                    type="text"
                    placeholder="Paste video URL (e.g. YouTube, Vimeo)"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-teal-500 outline-none"
                    value={stepContent}
                    onChange={(e) => setStepContent(e.target.value)}
                />
            )}

            {stepType === 'reflection' && (
                <>
                    <input
                        type="text"
                        placeholder="Reflection Title (e.g. Pause & Reflect)"
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-teal-500 outline-none"
                        value={stepContent}
                        onChange={(e) => setStepContent(e.target.value)}
                    />
                    <textarea
                        rows={2}
                        placeholder="What question do you want to ask the user?"
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-teal-500 outline-none"
                        value={promptQuestion}
                        onChange={(e) => setPromptQuestion(e.target.value)}
                    />
                </>
            )}

            <button
                onClick={handleAddStep}
                disabled={adding}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
                {adding ? 'Adding...' : `Add ${stepType} Block`}
            </button>
        </div>
      </div>
    </div>
  );
}