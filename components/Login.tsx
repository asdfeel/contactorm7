import React from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth, db } from '../firebase'; // db import 추가
import { doc, getDoc } from 'firebase/firestore'; // Firestore 함수 import

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 관리자 확인 로직 추가
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminDocSnap = await getDoc(adminDocRef);

      if (adminDocSnap.exists()) {
        console.log('관리자 로그인 성공:', user.displayName);
        onLoginSuccess();
      } else {
        console.warn('관리자 권한 없음:', user.displayName);
        await signOut(auth); // 관리자가 아니면 로그아웃
        alert('관리자만 로그인할 수 있습니다.');
      }
    } catch (error: any) {
      console.error('Google 로그인 오류:', error.message);
      alert('로그인 중 오류가 발생했습니다: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>관리자 로그인</h2>
      <button onClick={signInWithGoogle}>Google로 로그인</button>
    </div>
  );
};

export default Login;