'use client';

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiLoader, FiSave, FiTrash2, FiCheckCircle, FiList, FiUser, FiChevronDown, FiChevronUp, FiMessageSquare } from 'react-icons/fi';
import Navbar from '../components/navbar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface GeneratedIdea {
  projectTitle: string;
  briefDescription: string;
  keyFeatures: string[];
  
  technicalStack: string[];
  
  potentialChallenges: string[];
  uniqueSellingPoints: string[];
  targetAudience: string;
  futureEnhancements: string[];
}

interface TeamMember {
  name: string;
  skills: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface Task {
  description: string;
  explanation: string;
  estimatedTime: number;
}

interface TeamMemberTasks {
  tasks: Task[];
  totalTime: number;
}

interface TaskBreakdown {
  [memberName: string]: TeamMemberTasks;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MarkdownRenderer = ({ content }: { content: string }) => (
  <ReactMarkdown 
    remarkPlugins={[remarkGfm]} 
    components={{
      h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
      h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
      h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
      p: ({node, ...props}) => <p className="mb-2" {...props} />,
      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
      li: ({node, ...props}) => <li className="ml-4" {...props} />,
      a: ({node, ...props}) => <a className="text-blue-500 hover:underline" {...props} />,
      code: ({inline, ...props}: React.HTMLAttributes<HTMLElement> & {inline?: boolean}) => 
        inline ? (
          <code className="bg-gray-200 rounded px-1" {...props} />
        ) : (
          <code className="block bg-gray-200 rounded p-2 my-2" {...props} />
        ),
    }}
  />
);

export default function HackathonIdeaGenerator() {
  const router = useRouter();
  const { isLoaded, userId, sessionId, getToken } = useAuth();

  const [formData, setFormData] = useState({
    theme: '',
    technologies: '',
    problem: '',
    timeRange: '',
    skillLevel: ''
  });
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedIdeas, setSavedIdeas] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [generatedIdea, setGeneratedIdea] = useState<GeneratedIdea | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([{ name: '', skills: '', skillLevel: 'beginner' }]);
  const [taskBreakdown, setTaskBreakdown] = useState<TaskBreakdown | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const steps = [
    { name: 'Theme', explanation: 'what is the theme of the hackathon?', field: 'theme' },
    { name: 'Technologies', explanation: 'what tech stack are you planning on using?', field: 'technologies' },
    { name: 'Problem', explanation: 'what problem do you want to solve?', field: 'problem' },
    { name: 'Time Range', explanation: 'how long is the hackathon?', field: 'timeRange' },
    { name: 'Team Members', explanation: 'add all your members here', field: 'teamMembers' },
  ];

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/');
    }
  }, [isLoaded, userId, router]);

  useEffect(() => {
    const storedIdeas = localStorage.getItem('savedIdeas');
    if (storedIdeas) {
      setSavedIdeas(JSON.parse(storedIdeas));
    }
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    };

    scrollToBottom();
  }, [chatMessages]);

  // If auth is not loaded or user is not authenticated, don't render the component
  if (!isLoaded || !userId) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedIdea(null);
    setError(null);
    setTaskBreakdown(null);

    try {
      // Generate idea
      const ideaResponse = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateIdea',
          data: {
            ...formData,
            technologies: formData.technologies.split(',').map(tech => tech.trim())
          }
        })
      });

      const ideaData = await ideaResponse.json();

      if (!ideaResponse.ok) {
        throw new Error(ideaData.error || `HTTP error! status: ${ideaResponse.status}`);
      }

      if (ideaData.result) {
        setGeneratedIdea(ideaData.result);
        
        // Generate tasks immediately after generating the idea
        const taskResponse = await fetch('/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generateTasks',
            data: {
              idea: ideaData.result,
              teamMembers: teamMembers
            }
          })
        });

        const taskData = await taskResponse.json();

        if (!taskResponse.ok) {
          throw new Error(taskData.error || `HTTP error! status: ${taskResponse.status}`);
        }

        if (taskData.result) {
          setTaskBreakdown(taskData.result);
        } else if (taskData.rawResponse) {
          setError(`Failed to parse AI response for tasks. Raw response: ${taskData.rawResponse}`);
        } else {
          throw new Error('No result in task response');
        }

        setShowResults(true);
      } else if (ideaData.rawResponse) {
        setError(`Failed to parse AI response for idea. Raw response: ${ideaData.rawResponse}`);
      } else {
        throw new Error('No result in idea response');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error && error.cause) {
        console.error('Error cause:', error.cause);
        setError(prev => `${prev}\nCause: ${String(error.cause)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIdea = () => {
    if (result) {
      const updatedIdeas = [...savedIdeas, result];
      setSavedIdeas(updatedIdeas);
      localStorage.setItem('savedIdeas', JSON.stringify(updatedIdeas));
    }
  };

  const handleDeleteIdea = (index: number) => {
    const updatedIdeas = savedIdeas.filter((_, i) => i !== index);
    setSavedIdeas(updatedIdeas);
    localStorage.setItem('savedIdeas', JSON.stringify(updatedIdeas));
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      setProgress(prev => Math.min((currentStep + 1) * (100 / steps.length), 100));
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setProgress(prev => Math.max((currentStep - 1) * (100 / steps.length), 0));
    }
  };

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setTeamMembers(updatedMembers);
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: '', skills: '', skillLevel: 'beginner' }]);
  };

  const removeTeamMember = (index: number) => {
    const updatedMembers = teamMembers.filter((_, i) => i !== index);
    setTeamMembers(updatedMembers);
  };

  const handleToggleTask = (memberName: string, taskIndex: number) => {
    setExpandedTasks(prev => ({
      ...prev,
      [`${memberName}-${taskIndex}`]: !prev[`${memberName}-${taskIndex}`]
    }));
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          data: {
            messages: [...chatMessages, newMessage],
            idea: generatedIdea,
            taskBreakdown: taskBreakdown
          }
        })
      });

      const data = await response.json();
      if (data.result) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.result }]);
      } else {
        throw new Error('No result in response');
      }
    } catch (error) {
      console.error('Error in chat:', error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
  };

  const renderFormField = () => {
    const currentField = steps[currentStep - 1].field;
    const { name, explanation } = steps[currentStep - 1];

    return (
      <div className=''>
        <label htmlFor={currentField} className="block mb-2 font-medium text-foreground">
          {name}
          <span className="ml-2 text-sm italic text-muted-foreground">
            [{explanation}]
          </span>
        </label>
        {currentField === 'problem' ? (
          <textarea
            id={currentField}
            name={currentField}
            value={formData[currentField as keyof typeof formData]}
            onChange={handleChange}
            className="w-full p-3 border rounded-md bg-input text-foreground"
            rows={4}
            required
          ></textarea>
        ) : currentField === 'teamMembers' ? (
          <div>
            <label className="block mb-2 font-medium text-foreground">Team Members:</label>
            {teamMembers.map((member, index) => (
              <div key={index} className="mb-4 p-4 border rounded-md">
                <input
                  type="text"
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                  className="w-full p-2 mb-2 border rounded-md bg-input text-foreground"
                />
                <input
                  type="text"
                  placeholder="Skills"
                  value={member.skills}
                  onChange={(e) => handleTeamMemberChange(index, 'skills', e.target.value)}
                  className="w-full p-2 mb-2 border rounded-md bg-input text-foreground"
                />
                <select
                  value={member.skillLevel}
                  onChange={(e) => handleTeamMemberChange(index, 'skillLevel', e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                  className="w-full p-2 mb-2 border rounded-md bg-input text-foreground"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeTeamMember(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded-md"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTeamMember}
              className="bg-green-500 text-white px-4 py-2 rounded-md"
            >
              Add Team Member
            </button>
          </div>
        ) : (
          <input
            type="text"
            id={currentField}
            name={currentField}
            value={formData[currentField as keyof typeof formData]}
            onChange={handleChange}
            className="w-full p-3 border rounded-md bg-input text-foreground"
            required
          />
        )}
      </div>
    );
  };

  const renderGeneratedIdea = () => {
    if (!generatedIdea) return null;

    return (
      <motion.div 
        className=" bg-card py-8 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-primary">{generatedIdea.projectTitle}</h2>
        <p className="text-lg mb-6 text-foreground">{generatedIdea.briefDescription}</p>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-primary">Key Features</h3>
          <ul className="list-disc list-inside">
            {generatedIdea.keyFeatures.map((feature, index) => (
              <li key={index} className="text-foreground">{feature}</li>
            ))}
          </ul>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-primary">Technical Stack</h3>
          <div className="flex flex-wrap gap-2">
            {generatedIdea.technicalStack.map((tech, index) => (
              <span key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-primary">Potential Challenges</h3>
          <ul className="list-disc list-inside">
            {generatedIdea.potentialChallenges.map((challenge, index) => (
              <li key={index} className="text-foreground">{challenge}</li>
            ))}
          </ul>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-primary">Unique Selling Points</h3>
          <ul className="list-disc list-inside">
            {generatedIdea.uniqueSellingPoints.map((usp, index) => (
              <li key={index} className="text-foreground">{usp}</li>
            ))}
          </ul>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-primary">Target Audience</h3>
          <p className="text-foreground">{generatedIdea.targetAudience}</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-primary">Future Enhancements</h3>
          <ul className="list-disc list-inside">
            {generatedIdea.futureEnhancements.map((enhancement, index) => (
              <li key={index} className="text-foreground">{enhancement}</li>
            ))}
          </ul>
        </div>
        
        <button
          onClick={() => handleSaveIdea()}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiSave className="mr-2" /> Save Idea
        </button>
      </motion.div>
    );
  };

  const renderTaskBreakdown = () => {
    if (!taskBreakdown) return null;

    const totalTeamTime = Object.values(taskBreakdown).reduce(
      (sum, member) => sum + member.totalTime,
      0
    );

    return (
      <motion.div
        className=" bg-card py-8 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-primary">Task Breakdown</h2>
        <p className="text-base mb-4 text-foreground">
          Estimated total team time: {totalTeamTime} hours
        </p>
        {Object.entries(taskBreakdown).map(([memberName, memberTasks]) => (
          <div key={memberName} className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-primary">
              {memberName} (Total: {memberTasks.totalTime} hours)
            </h3>
            <ul className="space-y-2">
              {memberTasks.tasks.map((task, index) => (
                <li key={index} className="border rounded-md p-2">
                  <div
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center cursor-pointer"
                    onClick={() => handleToggleTask(memberName, index)}
                  >
                    <span className="text-foreground mb-1 sm:mb-0">{task.description}</span>
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
                      <span className="text-xs text-muted-foreground">
                        {task.estimatedTime}h
                      </span>
                      <button className="ml-2 p-1">
                        {expandedTasks[`${memberName}-${index}`] ? (
                          <FiChevronUp />
                        ) : (
                          <FiChevronDown />
                        )}
                      </button>
                    </div>
                  </div>
                  {expandedTasks[`${memberName}-${index}`] && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p className="whitespace-pre-wrap">{task.explanation}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </motion.div>
    );
  };

  const renderResultsScreen = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex-1 bg-background"
      >
        <div className="pt-5 max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          <button
            onClick={() => setShowResults(false)}
            className="bg-secondary text-secondary-foreground px-4 p-2 rounded-md mb-4"
          > 
            Back to Form
          </button>
          
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* Left column */}
            <div className="w-full lg:w-1/2">
              {renderGeneratedIdea()}
            </div>

            {/* Right column */}
            <div className="w-full lg:w-1/2">
              {/* Chat component for larger screens */}
              <div className="hidden lg:block">
                {renderChatComponent()}
              </div>

              {/* Task Breakdown */}
              {renderTaskBreakdown()}

              {/* Chat component for smaller screens */}
              <div className="lg:hidden">
                {renderChatComponent()}
              </div>
            </div>
          </div>
          
          {/* Saved Ideas section */}
          {savedIdeas.length > 0 && (
            <motion.div
              className="mt-8 bg-card p-4 sm:p-6 md:p-8 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">Saved Ideas:</h2>
              {savedIdeas.map((idea, index) => (
                <div key={index} className="mb-4 p-4 bg-muted rounded-md relative">
                  <pre className="whitespace-pre-wrap text-foreground">{idea}</pre>
                  <button
                    onClick={() => handleDeleteIdea(index)}
                    className="absolute top-2 right-2 text-red-500"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
          
          {/* Error display */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <pre className="whitespace-pre-wrap text-sm">{error}</pre>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // New function to render the chat component
  const renderChatComponent = () => {
    return (
      <motion.div
        className="bg-card p-4 sm:p-6 md:p-8 rounded-lg shadow-lg mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">Chat with hackwoo</h2>
        <div ref={chatContainerRef} className="h-96 overflow-y-auto mb-4 p-4 bg-muted rounded-md">
          {chatMessages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}>
                {message.role === 'user' ? (
                  <span>{message.content}</span>
                ) : (
                  <MarkdownRenderer content={message.content} />
                )}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleChatSubmit} className="flex">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-grow p-2 border rounded-l-md bg-input text-foreground"
            placeholder="Ask about the project or tasks..."
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-r-md"
          >
            <FiMessageSquare />
          </button>
        </form>
      </motion.div>
    );
  };

  return (
    <div className="sm:w-[90%] md:w-[60vw] lg:w-[50vw] mx-auto p-4 sm:p-6 md:p-8">
      {/* Progress bar and form */}
      {!showResults && (
        <>
          <div className="mb-6 sm:mb-8">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center mt-2">Step {currentStep} of {steps.length}</p>
          </div>

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-4 sm:space-y-6 bg-card p-4 sm:p-6 md:p-8 rounded-lg shadow-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {renderFormField()}
            
            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
              <button
                type="button"
                onClick={handlePrevStep}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md w-full sm:w-auto"
                disabled={currentStep === 1}
              >
                Previous
              </button>
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md w-full sm:w-auto"
                >
                  Next
                </button>
              ) : (
                <motion.button 
                  type="submit" 
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium flex items-center justify-center w-full sm:w-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <FiLoader className="animate-spin mr-2" />
                  ) : (
                    <FiSend className="mr-2" />
                  )}
                  {isLoading ? 'Generating...' : 'Generate Idea'}
                </motion.button>
              )}
            </div>
          </motion.form>
        </>
      )}
      
      <AnimatePresence>
        {showResults && renderResultsScreen()}
      </AnimatePresence>
    </div>
  );
}