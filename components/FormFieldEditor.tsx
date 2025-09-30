import React, { useState, useRef } from 'react';
import { PlusIcon, EyeIcon } from './icons';
import CodePreview from './CodePreview';
import { ContactForm } from '../types';

interface FormFieldEditorProps {
    form: ContactForm;
    onSave: (form: ContactForm) => void;
    goToDashboard: () => void;
    onPreview: (id: string) => void;
}

const FormFieldEditor: React.FC<FormFieldEditorProps> = ({ form, onSave, goToDashboard, onPreview }) => {
    const [formTitle, setFormTitle] = useState(form.title);
    const [activeTab, setActiveTab] = useState('form');
    const [steps, setSteps] = useState(form.steps);
    const [activeStep, setActiveStep] = useState(form.steps[0]?.id || 1);
    const [nextStepId, setNextStepId] = useState(
        form.steps.length > 0 ? Math.max(...form.steps.map(s => s.id)) + 1 : 2
    );

    // Mail Tab State
    const [mailTo, setMailTo] = useState(form.mail.to);
    const [mailFrom, setMailFrom] = useState(form.mail.from);
    const [mailSubject, setMailSubject] = useState(form.mail.subject);
    const [mailHeaders, setMailHeaders] = useState(form.mail.headers);
    const [mailBody, setMailBody] = useState(form.mail.body);

    // Messages Tab State
    const [messages, setMessages] = useState(form.messages);
    
    // Multi-Step Settings
    const [nextButtonText, setNextButtonText] = useState(form.multiStepSettings.nextButtonText);
    const [prevButtonText, setPrevButtonText] = useState(form.multiStepSettings.prevButtonText);

    // Conditional Fields
    const [conditionalLogic, setConditionalLogic] = useState(form.conditionalFieldsSettings.logic);

    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setMessages(prev => ({ ...prev, [name]: value }));
    };

    const formTextareas = useRef<{ [key: number]: HTMLTextAreaElement | null }>({});

    const addStep = () => {
      const newStep = { id: nextStepId, title: `Step ${nextStepId}`, content: '' };
      setSteps([...steps, newStep]);
      setActiveStep(newStep.id);
      setNextStepId(prev => prev + 1);
    };

    const removeStep = (id: number) => {
      if (steps.length <= 1) return;
      const stepIndex = steps.findIndex(step => step.id === id);
      const newSteps = steps.filter(step => step.id !== id);
      setSteps(newSteps);

      if (activeStep === id) {
          if (newSteps.length > 0) {
            setActiveStep(newSteps[Math.max(0, stepIndex - 1)].id);
          }
      }
    };

    const handleStepContentChange = (id: number, content: string) => {
      setSteps(steps.map(step => (step.id === id ? { ...step, content } : step)));
    };

    const insertTag = (tag: string) => {
      const textarea = formTextareas.current[activeStep];
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + tag + text.substring(end);
        handleStepContentChange(activeStep, newText);
        textarea.focus();
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + tag.length;
        }, 0);
      }
    };

    const extractFieldNames = (content: string) => {
      const regex = /\[(?:[a-z][a-z0-9_]*\*?)\s+([a-zA-Z0-9_-]+)/g;
      const matches = content.matchAll(regex);
      return Array.from(matches, m => m[1]);
    };

    const allFieldNames = steps.reduce((acc, step) => {
      return [...acc, ...extractFieldNames(step.content)];
    }, [] as string[]);
    
    const uniqueFieldNames = [...new Set(allFieldNames)];

    const getCurrentFormState = (): ContactForm => {
        return {
            ...form,
            title: formTitle,
            steps,
            mail: {
                to: mailTo,
                from: mailFrom,
                subject: mailSubject,
                headers: mailHeaders,
                body: mailBody,
            },
            messages,
            multiStepSettings: {
                nextButtonText,
                prevButtonText,
            },
            conditionalFieldsSettings: {
                logic: conditionalLogic,
            },
        };
    }

    const handleSave = () => {
      const updatedForm = getCurrentFormState();
      onSave(updatedForm);
    };

    const handlePreview = () => {
        onPreview(form.id);
    }
    
    const fieldButtons = [
      { label: '텍스트', tag: '[text your-text]' },
      { label: '이메일', tag: '[email* your-email]' },
      { label: 'URL', tag: '[url your-url]' },
      { label: '전화', tag: '[tel your-tel]' },
      { label: '숫자', tag: '[number your-number]' },
      { label: '날짜', tag: '[date your-date]' },
      { label: '텍스트 영역', tag: '[textarea your-textarea]' },
      { label: '드롭다운 메뉴', tag: '[select your-menu "Option 1" "Option 2"]' },
      { label: '체크박스', tag: '[checkbox your-checkbox "Option 1"]' },
      { label: '라디오 버튼', tag: '[radio your-radio "Option 1"]' },
      { label: '동의하기', tag: '[acceptance your-acceptance] Check here to accept' },
      { label: '퀴즈', tag: '[quiz your-quiz "1+1=?|2"]' },
      { label: '파일', tag: '[file your-file]' },
      { label: '제출', tag: '[submit "제출"]' },
      { label: 'Conditional Fields', tag: '[group your-group-name]\n\n[/group]' },
    ];

    return (
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              문의 양식 편집
              <a href="#" onClick={(e) => { e.preventDefault(); goToDashboard(); }} className="ml-4 text-sm text-brand-blue hover:underline">
                문의 양식 목록으로 돌아가기
              </a>
            </h1>
            <div className="flex items-center space-x-2">
                <button onClick={handlePreview} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 flex items-center">
                    <EyeIcon />
                    <span className="ml-2">미리보기</span>
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-md hover:bg-blue-800">
                저장
                </button>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 p-6">
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full text-lg p-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {['form', 'mail', 'messages', 'additional_settings', 'multi_step_settings', 'conditional_fields_settings'].map((tabId) => {
                  const tabLabels: { [key: string]: string } = {
                    form: '양식',
                    mail: '메일',
                    messages: '메시지',
                    additional_settings: '추가 설정',
                    multi_step_settings: 'Multi-Step Settings',
                    conditional_fields_settings: 'Conditional fields Settings',
                  };
                  return (
                    <button
                      key={tabId}
                      onClick={() => setActiveTab(tabId)}
                      className={`${activeTab === tabId
                        ? 'border-brand-blue text-brand-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      {tabLabels[tabId]}
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="pt-6">
              {activeTab === 'form' && (
                <div>
                  <div className="flex items-center border-b border-gray-200 -mt-2">
                    {steps.map(step => (
                      <div key={step.id} className="relative">
                        <button
                          onClick={() => setActiveStep(step.id)}
                          className={`py-2 px-4 text-sm font-medium ${activeStep === step.id ? 'bg-white border border-gray-200 border-b-0 rounded-t-md text-brand-blue' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {step.title}
                        </button>
                        {steps.length > 1 && (
                           <button onClick={() => removeStep(step.id)} className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600">&times;</button>
                        )}
                      </div>
                    ))}
                    <button onClick={addStep} className="p-2 text-gray-500 hover:text-brand-blue"><PlusIcon /></button>
                  </div>

                  <div className="bg-gray-100 p-2 my-4 rounded-md text-sm">
                    {fieldButtons.map(({ label, tag }) => (
                      <button
                        key={label}
                        onClick={() => insertTag(tag)}
                        className="m-1 px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {steps.map(step => (
                    <div key={step.id} style={{ display: activeStep === step.id ? 'block' : 'none' }}>
                      <textarea
                        ref={el => { formTextareas.current[step.id] = el; }}
                        value={step.content}
                        onChange={(e) => handleStepContentChange(step.id, e.target.value)}
                        className="w-full h-64 p-3 font-mono text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue"
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'mail' && (
                <div>
                  <p className="text-sm mb-4">다음 양식에서 아래 메일-태그를 사용할 수 있습니다: <br />
                    {uniqueFieldNames.map(name => <code key={name} className="bg-gray-200 text-sm p-1 rounded mx-1">[{name}]</code>)}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">받는 사람</label>
                      <input type="text" value={mailTo} onChange={e => setMailTo(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">보내는 사람</label>
                      <input type="text" value={mailFrom} onChange={e => setMailFrom(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                      <input type="text" value={mailSubject} onChange={e => setMailSubject(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                     <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">추가 헤더</label>
                      <textarea value={mailHeaders} onChange={e => setMailHeaders(e.target.value)} className="w-full h-24 p-2 border border-gray-300 rounded-md font-mono text-sm"></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">메시지 본문</label>
                      <textarea value={mailBody} onChange={e => setMailBody(e.target.value)} className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm"></textarea>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div>
                  <div className="grid grid-cols-1 gap-y-4">
                  {Object.entries(messages).map(([key, value]) => {
                     const labels: { [key: string]: string } = {
                        success: '메시지를 보내주셔서 감사합니다. 발송을 완료했습니다.',
                        error: '발신자의 메시지를 보내지 못했습니다',
                        validation: '검증 오류가 발생했습니다',
                        spam: '제출을 스팸으로 간주했습니다',
                        acceptance_missing: '보내는 사람이 동의해야 하는 조건이 있습니다',
                        invalid_required: '보내는 사람이 입력해야 하는 입력란이 있습니다',
                        max_length: '최대 허용된 길이보다 긴 내용이 있는 입력란이 있습니다',
                        min_length: '최소 허용된 길이보다 짧은 내용이 있는 입력란이 있습니다',
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
                      };
                      return (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{labels[key]}</label>
                          <input
                            type="text"
                            name={key}
                            value={value}
                            onChange={handleMessageChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'additional_settings' && (
                <div>
                   <CodePreview
                      title="데이터베이스 저장을 위한 PHP 코드"
                      language="php"
                      code={`add_action('wpcf7_before_send_mail', function ($contact_form) {
    $submission = WPCF7_Submission::get_instance();
    if ($submission) {
        $form_id = $contact_form->id();
        // Replace YOUR_FORM_ID with the actual ID of your form
        if ($form_id == ${form.id}) { 
            global $wpdb;
            $table_name = $wpdb->prefix . 'your_custom_table';
            
            $data = $submission->get_posted_data();
            
            $wpdb->insert($table_name, array(
                ${uniqueFieldNames.map((name: string) => `'${name.replace(/-/g, '_')}' => $data['${name}']`).join(',\n                ')}
            ));
        }
    }
});`}
                    />
                </div>
              )}
               {activeTab === 'multi_step_settings' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Button Text</label>
                    <input
                      type="text"
                      value={nextButtonText}
                      onChange={(e) => setNextButtonText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Next"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Previous Button Text</label>
                    <input
                      type="text"
                      value={prevButtonText}
                      onChange={(e) => setPrevButtonText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Previous"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'conditional_fields_settings' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conditional Logic</label>
                  <textarea
                    value={conditionalLogic}
                    onChange={(e) => setConditionalLogic(e.target.value)}
                    className="w-full h-48 p-3 font-mono text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue"
                    placeholder={`show [your-group-name] if [your-field] equals "some-value"`}
                  />
                  <p className="text-xs text-gray-500 mt-2">Example: <code>show [group_name] if [field_name] equals "Option 1"</code></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
};

export default FormFieldEditor;