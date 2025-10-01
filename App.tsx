import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import FormFieldEditor from './components/FormFieldEditor';
import Preview from './components/Preview';
import { ContactForm } from './types';
import { db } from './firebase'; // Ensure db is imported
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-brand-gray min-h-screen">
        <header className="bg-brand-dark shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <h1 className="text-xl font-bold text-white">
                        WordPress Contact Form 7 Generator
                    </h1>
                </div>
            </div>
        </header>
        <main>{children}</main>
    </div>
);

const initialFormContent = `<label> <b>이름</b> (필수) </label>
    [text* your-name maxlength:10]  

<label> <b>성별</b> (필수) </label>
[radio sex use_label_element "남자" "여자"]

<label> <b>나이</b> (필수) </label>
    [number* age min:10 max:99] 

<label> <b>생년월일 (예. 860523)</b> (필수) </label>
    [number* jumin min:000001 max:999999] 

<label> <b>연락처</b> (필수) </label>
    [tel* tel]
    
[submit "제출"]`;

const defaultMailSettings = {
  to: 'your-email@example.com',
  from: 'your-name <your-email@example.com>',
  subject: '새 문의 양식 제출',
  headers: 'Reply-To: [your-email]',
  body: '다음 메시지가 [your-name]님으로부터 왔습니다.\n[your-email]\n[your-message]',
};

const defaultMessages = {
  success: '메시지가 성공적으로 전송되었습니다.',
  error: '메시지를 보내는 중 오류가 발생했습니다. 나중에 다시 시도하십시오.',
  validation: '유효성 검사 오류가 발생했습니다. 필드를 확인하고 다시 시도하십시오.',
  spam: '스팸으로 표시된 메시지입니다.',
  acceptance_missing: '필수 동의 필드를 수락해야 합니다.',
  invalid_required: '필수 필드를 입력하십시오.',
  upload_failed_not_allowed: '이 파일 형식은 허용되지 않습니다.',
  upload_failed: '파일 업로드에 실패했습니다.',
  invalid_date: '날짜 형식이 잘못되었습니다.',
  date_too_early: '날짜가 너무 이릅니다.',
  date_too_late: '날짜가 너무 늦습니다.',
  invalid_number: '숫자 형식이 잘못되었습니다.',
  number_too_small: '숫자가 너무 작습니다.',
  number_too_large: '숫자가 너무 큽니다.',
  quiz_not_answered: '퀴즈를 풀어야 합니다.',
  invalid_email: '이메일 주소가 잘못되었습니다.',
  invalid_url: 'URL 형식이 잘못되었습니다.',
  invalid_tel: '전화번호 형식이 잘못되었습니다.',
  max_length: '입력한 내용이 너무 깁니다.',
  min_length: '입력한 내용이 너무 짧습니다.',
};

const defaultMultiStepSettings = {
  nextButtonText: '다음',
  prevButtonText: '이전',
};

const defaultConditionalFieldsSettings = {
  logic: '',
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true); // New loading state
  const [view, setView] = useState<'dashboard' | 'editor' | 'preview'>('dashboard');
  const [forms, setForms] = useState<ContactForm[]>([]); // Initial state is empty, will load from Firestore
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [previewingFormId, setPreviewingFormId] = useState<string | null>(null);

  // useEffect to load forms from Firestore
  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'forms'));
        const fetchedForms: ContactForm[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<ContactForm, 'id'>
        }));
        setForms(fetchedForms);
      } catch (error) {
        console.error("Error fetching forms: ", error);
        // Optionally, set an error state here
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  // The isAdmin state and its useEffect are no longer needed for access control,
  // but keeping it for now to avoid breaking other parts if they rely on it.
  // It can be removed if confirmed not needed.
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    setIsAdmin(adminParam === 'true');
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#preview/')) {
        const formId = hash.substring('#preview/'.length);
        if (forms.some(f => f.id === formId)) {
          setPreviewingFormId(formId);
          setView('preview');
        }
      } else if (isAdmin) {
        setView('dashboard');
        setPreviewingFormId(null);
      } else {
        setView('dashboard');
        setPreviewingFormId(null);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check on load
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [forms, isAdmin]);


  const goToDashboard = () => {
    if (window.location.hash) {
      window.location.hash = '';
    }
    setView('dashboard');
    setEditingFormId(null);
    setPreviewingFormId(null);
  };

  const handleAddForm = () => {
      const newForm: ContactForm = {
          id: new Date().getTime().toString(16),
          title: `새 문의 양식 ${forms.length + 1}`,
          steps: [{ id: 1, title: 'Step 1', content: '' }],
          mail: defaultMailSettings,
          messages: defaultMessages,
          multiStepSettings: defaultMultiStepSettings,
          conditionalFieldsSettings: defaultConditionalFieldsSettings,
          date: new Date().toLocaleString('ko-KR'),
      };
      setForms(prevForms => [...prevForms, newForm]);
      setEditingFormId(newForm.id);
      setView('editor');
  };
  
  const handleEditForm = (id: string) => {
      setEditingFormId(id);
      setView('editor');
  };

  const handleDuplicateForm = (id: string) => {
    const formToDuplicate = forms.find(form => form.id === id);
    if (!formToDuplicate) return;

    const newForm: ContactForm = {
        ...JSON.parse(JSON.stringify(formToDuplicate)), // Deep copy
        id: new Date().getTime().toString(16),
        title: `${formToDuplicate.title} (복사됨)`,
        date: new Date().toLocaleString('ko-KR'),
    };
    
    setForms(prevForms => [...prevForms, newForm]);
  };

  const handlePreviewForm = (id: string) => {
      window.location.hash = `preview/${id}`;
  };

  const handleClosePreview = () => {
      window.location.hash = '';
  };

  const handleDeleteForm = (id: string) => {
      if (window.confirm('이 문의 양식을 정말로 삭제하시겠습니까?')) {
          setForms(prevForms => prevForms.filter(form => form.id !== id));
      }
  };

  const handleSaveForm = (updatedForm: ContactForm) => {
      setForms(prevForms => prevForms.map(form => form.id === updatedForm.id ? { ...updatedForm, date: new Date().toLocaleString('ko-KR') } : form));
      goToDashboard();
  };
  
  const formToPreview = forms.find(form => form.id === previewingFormId);

  if (view === 'preview' && formToPreview) {
      return <Preview form={formToPreview} closePreview={handleClosePreview} />
  }


  
  const formToEdit = forms.find(form => form.id === editingFormId);

  const renderContent = () => {
      if (view === 'editor' && formToEdit) {
           return (
            <FormFieldEditor
                key={formToEdit.id}
                form={formToEdit}
                onSave={handleSaveForm}
                goToDashboard={goToDashboard}
                onPreview={handlePreviewForm}
            />
           )
      }

      return (
         <Dashboard 
            forms={forms}
            onAddForm={handleAddForm}
            onEditForm={handleEditForm}
            onDeleteForm={handleDeleteForm}
            onPreviewForm={handlePreviewForm}
            onDuplicateForm={handleDuplicateForm}
        />
      );
  }


  return (
    <MainLayout>
        {renderContent()}
    </MainLayout>
  );
};

export default App;