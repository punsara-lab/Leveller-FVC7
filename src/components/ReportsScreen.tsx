import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  generateWeeklyReport, 
  generateMonthlyReport, 
  downloadReport, 
  saveReportToLog, 
  getReportLogs,
  WeeklyReport,
  MonthlyReport,
  ReportLog
} from '@/utils/reportSystem';
import { Download, Calendar, TrendingUp, Award, ChevronLeft, FileText } from 'lucide-react';

const ReportsScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generate');
  const [currentWeeklyReport, setCurrentWeeklyReport] = useState<WeeklyReport | null>(null);
  const [currentMonthlyReport, setCurrentMonthlyReport] = useState<MonthlyReport | null>(null);
  const [reportLogs] = useState<ReportLog[]>(getReportLogs());

  const generateAndShowWeeklyReport = () => {
    const report = generateWeeklyReport();
    setCurrentWeeklyReport(report);
    saveReportToLog(report, 'weekly');
  };

  const generateAndShowMonthlyReport = () => {
    const report = generateMonthlyReport();
    setCurrentMonthlyReport(report);
    saveReportToLog(report, 'monthly');
  };

  const handleDownloadWeekly = () => {
    if (currentWeeklyReport) {
      downloadReport(currentWeeklyReport, 'weekly');
    }
  };

  const handleDownloadMonthly = () => {
    if (currentMonthlyReport) {
      downloadReport(currentMonthlyReport, 'monthly');
    }
  };

  const getRankColor = (rank: string) => {
    if (rank === 'LEGENDARY') return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    if (rank === 'EXCELLENT') return 'bg-gradient-to-r from-green-400 to-blue-500';
    if (rank === 'GREAT') return 'bg-gradient-to-r from-blue-400 to-purple-500';
    if (rank === 'GOOD') return 'bg-gradient-to-r from-green-400 to-teal-500';
    if (rank === 'DECENT') return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 'NEEDS IMPROVEMENT') return 'bg-gradient-to-r from-orange-400 to-red-500';
    return 'bg-gradient-to-r from-red-500 to-red-700';
  };

  return (
    <div className="min-h-screen animated-bg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/mission')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Mission
            </Button>
            <div>
              <h1 className="text-4xl font-orbitron font-bold text-white mb-2">
                PROGRESS REPORTS
              </h1>
              <p className="text-blue-300">Track your journey with detailed analytics</p>
            </div>
          </div>
          <FileText className="w-12 h-12 text-blue-400" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/20">
            <TabsTrigger value="generate" className="text-white data-[state=active]:bg-white/20">
              Generate Reports
            </TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-white/20">
              Report History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Weekly Report Section */}
            <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Weekly Report
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Generate your weekly progress summary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={generateAndShowWeeklyReport}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Generate This Week's Report
                </Button>
                
                {currentWeeklyReport && (
                  <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-bold">Weekly Report</h3>
                      <Badge className={`text-white ${getRankColor(currentWeeklyReport.rank)}`}>
                        {currentWeeklyReport.rank}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-2xl font-bold text-blue-400">{currentWeeklyReport.completedDays}</div>
                        <div className="text-sm text-blue-300">Days Completed</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-2xl font-bold text-green-400">{currentWeeklyReport.averageSpiritualMarks}</div>
                        <div className="text-sm text-green-300">Avg Spiritual</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-2xl font-bold text-purple-400">{currentWeeklyReport.averagePhysicalMarks}</div>
                        <div className="text-sm text-purple-300">Avg Physical</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-2xl font-bold text-yellow-400">{currentWeeklyReport.totalMarks}</div>
                        <div className="text-sm text-yellow-300">Total Marks</div>
                      </div>
                    </div>

                    {currentWeeklyReport.achievements.length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold mb-2">🏆 Achievements</h4>
                        <ul className="space-y-1">
                          {currentWeeklyReport.achievements.map((achievement, index) => (
                            <li key={index} className="text-green-300 text-sm">• {achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button
                      onClick={handleDownloadWeekly}
                      variant="outline"
                      className="w-full border-blue-500/50 text-blue-300 hover:bg-blue-500/20"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download as .TXT
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Report Section */}
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Monthly Report
                </CardTitle>
                <CardDescription className="text-purple-300">
                  Generate your monthly progress analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={generateAndShowMonthlyReport}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Generate This Month's Report
                </Button>
                
                {currentMonthlyReport && (
                  <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-bold">Monthly Report</h3>
                      <Badge className={`text-white ${getRankColor(currentMonthlyReport.rank)}`}>
                        {currentMonthlyReport.rank}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-2xl font-bold text-blue-400">{currentMonthlyReport.completedDays}</div>
                        <div className="text-sm text-blue-300">Days Completed</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-2xl font-bold text-green-400">{currentMonthlyReport.averageSpiritualMarks}</div>
                        <div className="text-sm text-green-300">Avg Spiritual</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-2xl font-bold text-purple-400">{currentMonthlyReport.averagePhysicalMarks}</div>
                        <div className="text-sm text-purple-300">Avg Physical</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-2xl font-bold text-yellow-400">{currentMonthlyReport.totalMarks}</div>
                        <div className="text-sm text-yellow-300">Total Marks</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-2xl font-bold text-cyan-400">{currentMonthlyReport.levelProgress}</div>
                        <div className="text-sm text-cyan-300">Current Level</div>
                      </div>
                    </div>

                    {currentMonthlyReport.achievements.length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold mb-2">🏆 Achievements</h4>
                        <ul className="space-y-1">
                          {currentMonthlyReport.achievements.map((achievement, index) => (
                            <li key={index} className="text-green-300 text-sm">• {achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentMonthlyReport.trends.length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold mb-2">📈 Trends</h4>
                        <ul className="space-y-1">
                          {currentMonthlyReport.trends.map((trend, index) => (
                            <li key={index} className="text-blue-300 text-sm">• {trend}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button
                      onClick={handleDownloadMonthly}
                      variant="outline"
                      className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download as .TXT
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-400" />
                  Report History
                </CardTitle>
                <CardDescription className="text-cyan-300">
                  View all your generated reports ({reportLogs.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No reports generated yet. Create your first report above!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportLogs.reverse().map((log) => (
                      <div key={log.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge variant={log.type === 'weekly' ? 'default' : 'secondary'}>
                              {log.type.toUpperCase()}
                            </Badge>
                            <span className="text-white font-medium">
                              {log.type === 'weekly' ? 'Weekly Report' : 'Monthly Report'}
                            </span>
                          </div>
                          <Badge className={`text-white ${getRankColor(log.report.rank)}`}>
                            {log.report.rank}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-300 mb-3">
                          Generated on: {new Date(log.generatedAt).toLocaleDateString()}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-white/5 p-2 rounded">
                            <div className="text-lg font-bold text-blue-400">{log.report.completedDays}</div>
                            <div className="text-xs text-blue-300">Days</div>
                          </div>
                          <div className="bg-white/5 p-2 rounded">
                            <div className="text-lg font-bold text-green-400">{log.report.averageSpiritualMarks}</div>
                            <div className="text-xs text-green-300">Spiritual</div>
                          </div>
                          <div className="bg-white/5 p-2 rounded">
                            <div className="text-lg font-bold text-purple-400">{log.report.averagePhysicalMarks}</div>
                            <div className="text-xs text-purple-300">Physical</div>
                          </div>
                        </div>
                        <Button
                          onClick={() => downloadReport(log.report, log.type)}
                          variant="outline"
                          size="sm"
                          className="w-full mt-3 border-white/20 text-white hover:bg-white/10"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReportsScreen;