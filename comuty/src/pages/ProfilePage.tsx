import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Loader2, Save, Edit, User, Mail, Calendar, Briefcase, Heart, Target, Camera } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { saveUserProfile, getUserProfile, updateUserProfile } from '../lib/firebase';

// 프로필 수정 스키마
const profileSchema = z.object({
  displayName: z.string().min(1, '이름을 입력하세요'),
  age: z.number().min(1).max(120).optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  interests: z.array(z.string()).optional(),
  experience: z.string().optional(),
  goals: z.array(z.string()).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const INTEREST_OPTIONS = [
  'AI/머신러닝', '딥러닝', '자연어처리', '컴퓨터 비전', '로보틱스',
  'AI 윤리', '생성형 AI', 'AI 개발도구', 'AI 비즈니스', '데이터 사이언스'
];

const GOAL_OPTIONS = [
  'AI 기술 학습', 'AI 프로젝트 개발', 'AI 창업', 'AI 연구',
  'AI 커뮤니티 참여', 'AI 트렌드 파악', 'AI 네트워킹', 'AI 지식 공유'
];

export function ProfilePage() {
  const { user, userProfile, setUserProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: userProfile?.displayName || '',
      age: userProfile?.age || undefined,
      gender: userProfile?.gender || '',
      occupation: userProfile?.occupation || '',
      interests: userProfile?.interests || [],
      experience: userProfile?.experience || '',
      goals: userProfile?.goals || [],
    },
  });

  const watchedInterests = watch('interests') || [];
  const watchedGoals = watch('goals') || [];

  // 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      if (user && !userProfile) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile as any);
          }
        } catch (error) {
          console.error('프로필 로드 실패:', error);
        }
      }
    };

    loadProfile();
  }, [user, userProfile, setUserProfile]);

  // 폼 데이터 업데이트
  useEffect(() => {
    if (userProfile) {
      setValue('displayName', userProfile.displayName);
      setValue('age', userProfile.age);
      setValue('gender', userProfile.gender || '');
      setValue('occupation', userProfile.occupation || '');
      setValue('interests', userProfile.interests || []);
      setValue('experience', userProfile.experience || '');
      setValue('goals', userProfile.goals || []);
    }
  }, [userProfile, setValue]);

  const handleInterestToggle = (interest: string) => {
    const currentInterests = watchedInterests;
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    setValue('interests', newInterests, { shouldDirty: true });
  };

  const handleGoalToggle = (goal: string) => {
    const currentGoals = watchedGoals;
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    setValue('goals', newGoals, { shouldDirty: true });
  };

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // 업데이트할 데이터만 포함
      const updates = {
        displayName: data.displayName,
        age: data.age,
        gender: data.gender,
        occupation: data.occupation,
        interests: data.interests,
        experience: data.experience,
        goals: data.goals,
      };

      // Firebase에 업데이트
      const updatedData = await updateUserProfile(user.uid, updates);
      
      // 로컬 상태 업데이트
      const updatedProfile = {
        ...userProfile,
        ...updatedData,
      };
      
      setUserProfile(updatedProfile as any);
      setIsEditing(false);
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      
      // 성공 메시지 3초 후 자동 제거
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      setError('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // 폼을 원래 값으로 리셋
    if (userProfile) {
      setValue('displayName', userProfile.displayName);
      setValue('age', userProfile.age);
      setValue('gender', userProfile.gender || '');
      setValue('occupation', userProfile.occupation || '');
      setValue('interests', userProfile.interests || []);
      setValue('experience', userProfile.experience || '');
      setValue('goals', userProfile.goals || []);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">내 프로필</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            프로필 수정
          </Button>
        )}
      </div>

      {/* 상태 메시지 */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 프로필 이미지 */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userProfile?.photoURL || user.photoURL || ''} />
                <AvatarFallback className="text-lg">
                  {userProfile?.displayName?.substring(0, 2) || user.displayName?.substring(0, 2) || '사용자'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Camera className="h-4 w-4" />
                  사진 변경
                </Button>
              )}
            </div>

            {/* 이름 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">이름</label>
              {isEditing ? (
                <input
                  {...register('displayName')}
                  type="text"
                  className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="이름을 입력하세요"
                />
              ) : (
                <p className="p-3 bg-muted rounded-md">{userProfile?.displayName || '설정되지 않음'}</p>
              )}
              {errors.displayName && (
                <p className="text-sm text-destructive">{errors.displayName.message}</p>
              )}
            </div>

            {/* 이메일 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                이메일
              </label>
              <p className="p-3 bg-muted rounded-md text-muted-foreground">{user.email}</p>
            </div>

            {/* 나이 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                나이
              </label>
              {isEditing ? (
                <input
                  {...register('age', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="120"
                  className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="나이를 입력하세요"
                />
              ) : (
                <p className="p-3 bg-muted rounded-md">{userProfile?.age || '설정되지 않음'}</p>
              )}
            </div>

            {/* 성별 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">성별</label>
              {isEditing ? (
                <select
                  {...register('gender')}
                  className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">선택하지 않음</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="other">기타</option>
                </select>
              ) : (
                <p className="p-3 bg-muted rounded-md">
                  {userProfile?.gender === 'male' ? '남성' : 
                   userProfile?.gender === 'female' ? '여성' : 
                   userProfile?.gender === 'other' ? '기타' : '설정되지 않음'}
                </p>
              )}
            </div>

            {/* 직업 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                직업
              </label>
              {isEditing ? (
                <input
                  {...register('occupation')}
                  type="text"
                  className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="직업을 입력하세요"
                />
              ) : (
                <p className="p-3 bg-muted rounded-md">{userProfile?.occupation || '설정되지 않음'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI 관심 분야 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              AI 관심 분야
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-3 text-sm rounded-md border transition-colors ${
                      watchedInterests.includes(interest)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-input hover:bg-accent'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {userProfile?.interests?.length ? (
                  userProfile.interests.map((interest) => (
                    <div key={interest} className="p-3 text-sm bg-primary/10 text-primary rounded-md border">
                      {interest}
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-muted-foreground">설정된 관심 분야가 없습니다.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI 경험 */}
        <Card>
          <CardHeader>
            <CardTitle>AI 경험</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <textarea
                {...register('experience')}
                rows={4}
                className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="AI 관련 경험을 자유롭게 작성해주세요..."
              />
            ) : (
              <p className="p-3 bg-muted rounded-md whitespace-pre-wrap">
                {userProfile?.experience || '작성된 경험이 없습니다.'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 목표 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              AI 학습 목표
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {GOAL_OPTIONS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleGoalToggle(goal)}
                    className={`p-3 text-sm rounded-md border transition-colors ${
                      watchedGoals.includes(goal)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-input hover:bg-accent'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {userProfile?.goals?.length ? (
                  userProfile.goals.map((goal) => (
                    <div key={goal} className="p-3 text-sm bg-primary/10 text-primary rounded-md border">
                      {goal}
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-muted-foreground">설정된 목표가 없습니다.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 수정 모드 버튼들 */}
        {isEditing && (
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isDirty}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
} 