import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import FormFieldEditor from './components/FormFieldEditor';
import Preview from './components/Preview';
import { ContactForm } from './types';

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


const initialForms: ContactForm[] = [
    {
        id: '15cbc5d',
        title: '문의 양식 1',
        steps: [{ id: 1, title: 'Step 1', content: initialFormContent }],
        mail: {
            to: import.meta.env.VITE_ADMIN_EMAIL || '[_site_admin_email]',
            from: '[_site_title] <wordpress@example.com>',
            subject: '[_site_title] "[your-subject]"',
            headers: 'Reply-To: [your-email]',
            body: `발신: [your-name] <[your-email]>

제목: [your-subject]

메시지 본문:
[your-message]

-- 
귀하의 웹사이트([_site_title] [_site_url])에서 문의 양식이 제출되었다는 알림입니다.`
        },
        messages: {
          success: '메시지를 보내주셔서 감사합니다. 발송을 완료했습니다.',
          error: '메시지를 보내지 못했습니다. 나중에 다시 시도해주세요.',
          validation: '하나 이상의 항목에 오류가 있습니다. 재확인 후 다시 시도해주세요.',
          spam: '제출을 스팸으로 간주했습니다',
          acceptance_missing: '메시지를 보내기 전에 먼저 조건에 동의하셔야 합니다.',
          invalid_required: '이 입력란을 채워주세요.',
          upload_failed_not_allowed: '알 수 없는 사유로 파일 업로드에 실패했습니다',
          upload_failed: 'PHP 오류로 파일 업로드에 실패했습니다.',
          invalid_date: '보내는 사람이 입력한 날짜 형식이 유효하지 않습니다',
          date_too_early: '날짜가 최소 허용치보다 이전입니다.',
          date_too_late: '날짜가 최대 허용치보다 나중입니다.',
          invalid_number: '보내는 사람이 입력한 숫자 양식이 유효하지 않습니다',
          number_too_small: '숫자가 최소 허용치보다 작습니다.',
          number_too_large: '숫자가 최대 허용치보다 큽니다.',
          quiz_not_answered: '사용자에 대한 올바른 답을 입력하지 않습니다.',
          invalid_email: '보내는 사람이 입력한 이메일 주소가 유효하지 않습니다',
          invalid_url: '보내는 사람이 입력한 URL이 유효하지 않습니다',
          invalid_tel: '보내는 사람이 입력한 전화번호가 유효하지 않습니다',
          max_length: '이 입력란의 내용이 너무 깁니다.',
          min_length: '이 입력란의 내용이 너무 짧습니다.',
        },
        multiStepSettings: {
            nextButtonText: 'Next',
            prevButtonText: 'Previous',
        },
        conditionalFieldsSettings: {
            logic: '',
        },
        date: '2025/09/30 9:44 pm'
    }
];

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'dashboard' | 'editor' | 'preview'>('dashboard');
  const [forms, setForms] = useState<ContactForm[]>(initialForms);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [previewingFormId, setPreviewingFormId] = useState<string | null>(null);

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
          mail: initialForms[0].mail,
          messages: initialForms[0].messages,
          multiStepSettings: initialForms[0].multiStepSettings,
          conditionalFieldsSettings: initialForms[0].conditionalFieldsSettings,
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

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="text-center p-12 text-gray-500">
          <h1 className="text-2xl font-bold mb-4">방문자 모드</h1>
          <p>폼을 미리 보려면 올바른 미리보기 링크가 필요합니다.</p>
        </div>
      </MainLayout>
    )
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