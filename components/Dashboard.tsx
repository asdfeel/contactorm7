

import React, { useState } from 'react';
import { ContactForm } from '../types';
import { ClipboardIcon, CheckIcon } from './icons';

interface DashboardProps {
  forms: ContactForm[];
  onAddForm: () => void;
  onEditForm: (id: string) => void;
  onDeleteForm: (id: string) => void;
  onPreviewForm: (id: string) => void;
  onDuplicateForm: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ forms, onAddForm, onEditForm, onDeleteForm, onPreviewForm, onDuplicateForm }) => {
  const [copiedState, setCopiedState] = useState<{ type: string; id: string } | null>(null);

  const handleCopy = (id: string, type: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedState({ id, type });
    setTimeout(() => {
      setCopiedState(null);
    }, 2000);
  };
  
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            문의 양식
            <button
              onClick={onAddForm}
              className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              문의 양식 추가
            </button>
          </h1>
          <div className="flex items-center space-x-4">
             {/* Search functionality can be added here */}
          </div>
        </div>
        
        <div className="mt-8 bg-white shadow-sm border border-gray-200">
            <div className="p-4 border-b">
                <div className="flex items-center space-x-2">
                    <select className="border border-gray-300 rounded-sm p-1.5 text-sm">
                        <option>일괄 동작</option>
                        <option>휴지통으로 이동</option>
                    </select>
                    <button className="px-3 py-1.5 border border-gray-300 bg-gray-100 hover:bg-gray-200 text-sm font-semibold rounded-sm">적용</button>
                </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="p-4 text-left w-10"><input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded"/></th>
                        <th scope="col" className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">제목</th>
                        <th scope="col" className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">임베드 & URL</th>
                        <th scope="col" className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">날짜</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {forms.length > 0 ? (
                      forms.map(form => {
                        const baseUrl = window.location.href.split('#')[0];
                        const formUrl = `${baseUrl}#preview/${form.id}`;
                        const iframeCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0" title="${form.title}"></iframe>`;
                        
                        return (
                          <tr key={form.id}>
                              <td className="p-4"><input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded"/></td>
                              <td className="p-4 whitespace-nowrap text-sm font-medium align-top">
                                 <span onClick={() => onEditForm(form.id)} className="text-brand-blue hover:underline cursor-pointer font-semibold">{form.title}</span>
                                 <div className="text-xs text-gray-500 mt-2 space-x-2">
                                      <button onClick={() => onEditForm(form.id)} className="text-gray-600 hover:text-brand-blue">편집</button>
                                      <span>|</span>
                                      <button onClick={() => onDuplicateForm(form.id)} className="text-gray-600 hover:text-brand-blue">복제</button>
                                      <span>|</span>
                                      <button onClick={() => onPreviewForm(form.id)} className="text-green-600 hover:text-green-800">미리보기</button>
                                      <span>|</span>
                                      <button onClick={() => onDeleteForm(form.id)} className="text-red-500 hover:text-red-700">삭제</button>
                                 </div>
                              </td>
                              <td className="p-4 text-sm text-gray-700 align-top">
                                  <div className="flex flex-col space-y-2">
                                      <div>
                                          <div className="font-semibold text-xs text-gray-500 mb-1">공유 URL</div>
                                            <div className="flex items-center space-x-1">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={formUrl}
                                                    className="w-full text-xs p-1 border border-gray-200 bg-gray-50 rounded-md"
                                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                                    aria-label="Shareable URL"
                                                />
                                                <button
                                                    onClick={() => handleCopy(form.id, 'url', formUrl)}
                                                    className="flex-shrink-0 px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-600 flex items-center text-xs transition-colors"
                                                    aria-label="Copy URL"
                                                >
                                                    {copiedState?.id === form.id && copiedState?.type === 'url' ? <CheckIcon /> : <ClipboardIcon />}
                                                    <span className="ml-1">{copiedState?.id === form.id && copiedState?.type === 'url' ? '복사됨!' : '복사'}</span>
                                                </button>
                                            </div>
                                      </div>
                                      <div>
                                          <div className="font-semibold text-xs text-gray-500 mb-1">아이프레임 코드</div>
                                          <button
                                              onClick={() => handleCopy(form.id, 'iframe', iframeCode)}
                                              className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-600 flex items-center text-xs transition-colors"
                                          >
                                              {copiedState?.id === form.id && copiedState?.type === 'iframe' ? <CheckIcon /> : <ClipboardIcon />}
                                              <span className="ml-1">{copiedState?.id === form.id && copiedState?.type === 'iframe' ? '복사됨!' : '코드 복사'}</span>
                                          </button>
                                      </div>
                                  </div>
                              </td>
                              <td className="p-4 whitespace-nowrap text-sm text-gray-500 align-top">{form.date}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center p-12 text-gray-500">
                          문의 양식이 없습니다. 첫 번째 양식을 추가해보세요!
                        </td>
                      </tr>
                    )}
                </tbody>
                 <tfoot className="bg-gray-50">
                    <tr>
                        <th scope="col" className="p-4 text-left w-10"><input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded"/></th>
                        <th scope="col" className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">제목</th>
                        <th scope="col" className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">임베드 & URL</th>
                        <th scope="col" className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">날짜</th>
                    </tr>
                </tfoot>
            </table>
             <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                    <select className="border border-gray-300 rounded-sm p-1.5 text-sm">
                        <option>일괄 동작</option>
                        <option>휴지통으로 이동</option>
                    </select>
                    <button className="px-3 py-1.5 border border-gray-300 bg-gray-100 hover:bg-gray-200 text-sm font-semibold rounded-sm">적용</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;