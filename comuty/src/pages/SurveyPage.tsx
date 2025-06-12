import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ChevronLeft, ChevronRight, User, Briefcase, Target, Sparkles } from 'lucide-react';
import { saveUserProfile } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';

// Survey validation schema
const surveySchema = z.object({
  age: z.number().min(13, '13세 이상만 가입 가능합니다').max(100, '유효한 나이를 입력하세요'),
  gender: z.string().min(1, '성별을 선택해주세요'),
  occupation: z.string().min(1, '직업을 선택해주세요'),
  interests: z.array(z.string()).min(1, '최소 1개의 관심분야를 선택해주세요'),
  experience: z.string().min(1, 'AI 경험 수준을 선택해주세요'),
  goals: z.array(z.string()).min(1, '최소 1개의 목표를 선택해주세요'),
});

type SurveyForm = z.infer<typeof surveySchema>;

const interests = [
  '머신러닝', '딥러닝', '자연어처리', '컴퓨터비전', 'ChatGPT', 'AI 윤리',
  '데이터분석', '프로그래밍', 'AI 뉴스', '연구논문', '창업/비즈니스', '교육'
];

const goals = [
  'AI 기술 학습', '업무 효율성 향상', '새로운 아이디어 발견', '네트워킹',
  '프로젝트 협업', '커리어 발전', '연구 및 개발', '창업 준비'
];

export function SurveyPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUserProfile } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SurveyForm>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      interests: [],
      goals: [],
    },
  });

  const watchedInterests = watch('interests') || [];
  const watchedGoals = watch('goals') || [];

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInterestToggle = (interest: string) => {
    const current = watchedInterests;
    const updated = current.includes(interest)
      ? current.filter(item => item !== interest)
      : [...current, interest];
    setValue('interests', updated, { shouldValidate: true });
  };

  const handleGoalToggle = (goal: string) => {
    const current = watchedGoals;
    const updated = current.includes(goal)
      ? current.filter(item => item !== goal)
      : [...current, goal];
    setValue('goals', updated, { shouldValidate: true });
  };

  const onSubmit = async (data: SurveyForm) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date(),
        surveyCompleted: true,
        ...data,
      };

      await saveUserProfile(user.uid, userProfile);
      setUserProfile(userProfile as any);
      navigate('/');
    } catch (error) {
      console.error('Survey submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">기본 정보</h3>
              <p className="text-muted-foreground text-sm">몇 가지 기본 정보를 알려주세요</p>
            </div>

            <div className="space-y-4">
              {/* Age */}
              <div>
                <label className="block text-sm font-medium mb-2">나이</label>
                <input
                  {...register('age', { valueAsNumber: true })}
                  type="number"
                  placeholder="예: 25"
                  className="w-full h-11 px-3 py-2 text-sm border border-input bg-background rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {errors.age && (
                  <p className="text-sm text-destructive mt-1">{errors.age.message}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium mb-2">성별</label>
                <div className="grid grid-cols-3 gap-2">
                  {['남성', '여성', '기타'].map((gender) => (
                    <label key={gender} className="cursor-pointer">
                      <input
                        {...register('gender')}
                        type="radio"
                        value={gender}
                        className="sr-only"
                      />
                      <div className="p-3 text-center border rounded-md hover:bg-accent transition-colors">
                        {gender}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-sm text-destructive mt-1">{errors.gender.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">직업 정보</h3>
              <p className="text-muted-foreground text-sm">현재 직업과 AI 경험을 알려주세요</p>
            </div>

            <div className="space-y-4">
              {/* Occupation */}
              <div>
                <label className="block text-sm font-medium mb-2">직업</label>
                <select
                  {...register('occupation')}
                  className="w-full h-11 px-3 py-2 text-sm border border-input bg-background rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">직업을 선택하세요</option>
                  <option value="개발자">개발자</option>
                  <option value="데이터 사이언티스트">데이터 사이언티스트</option>
                  <option value="연구원">연구원</option>
                  <option value="학생">학생</option>
                  <option value="디자이너">디자이너</option>
                  <option value="마케터">마케터</option>
                  <option value="기획자">기획자</option>
                  <option value="창업가">창업가</option>
                  <option value="기타">기타</option>
                </select>
                {errors.occupation && (
                  <p className="text-sm text-destructive mt-1">{errors.occupation.message}</p>
                )}
              </div>

              {/* AI Experience */}
              <div>
                <label className="block text-sm font-medium mb-2">AI 경험 수준</label>
                <div className="space-y-2">
                  {[
                    { value: 'beginner', label: '초보자 - AI에 대해 막 알아가기 시작했어요' },
                    { value: 'intermediate', label: '중급자 - 기본적인 AI 도구들을 사용할 수 있어요' },
                    { value: 'advanced', label: '고급자 - AI 모델을 직접 개발하거나 연구해요' },
                    { value: 'expert', label: '전문가 - AI 분야에서 일하고 있어요' }
                  ].map((level) => (
                    <label key={level.value} className="cursor-pointer block">
                      <input
                        {...register('experience')}
                        type="radio"
                        value={level.value}
                        className="sr-only"
                      />
                      <div className="p-3 border rounded-md hover:bg-accent transition-colors">
                        <p className="text-sm">{level.label}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.experience && (
                  <p className="text-sm text-destructive mt-1">{errors.experience.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">관심 분야</h3>
              <p className="text-muted-foreground text-sm">관심 있는 AI 분야를 선택해주세요 (복수 선택 가능)</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {interests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-3 text-sm border rounded-md transition-colors ${
                    watchedInterests.includes(interest)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-accent'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            {errors.interests && (
              <p className="text-sm text-destructive">{errors.interests.message}</p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">목표</h3>
              <p className="text-muted-foreground text-sm">AI 커뮤니티에서 이루고 싶은 목표를 선택해주세요</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {goals.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleGoalToggle(goal)}
                  className={`p-3 text-sm border rounded-md transition-colors ${
                    watchedGoals.includes(goal)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-accent'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
            {errors.goals && (
              <p className="text-sm text-destructive">{errors.goals.message}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">사용자 정보 설문</CardTitle>
            <span className="text-sm text-muted-foreground">
              {currentStep} / {totalSteps}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 mt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>

              {currentStep === totalSteps ? (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? '저장 중...' : '완료'}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 