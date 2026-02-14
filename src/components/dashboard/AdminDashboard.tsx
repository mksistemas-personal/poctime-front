import React, {useEffect, useState} from 'react';
import {DashboardService, IDashboardTotals} from "./DashboardService";
import {Card} from "primereact/card";

interface AdminDashboardProps {
    onNavigate?: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
    const [totals, setTotals] = useState<IDashboardTotals | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadTotals();
    }, []);

    const loadTotals = async () => {
        setLoading(true);
        try {
            const data = await DashboardService.getTotals();
            setTotals(data);
        } catch (error) {
            console.error("Erro ao carregar totais do dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    const getTitle = (key: string) => {
        switch (key) {
            case 'totalOrganizations':
                return 'Organizações';
            case 'totalEconomicGroups':
                return 'Grupos Econômicos';
            case 'totalPersons':
                return 'Pessoas';
            default:
                return key;
        }
    };

    const getIcon = (key: string) => {
        switch (key) {
            case 'totalOrganizations':
                return 'pi-building';
            case 'totalEconomicGroups':
                return 'pi-sitemap';
            case 'totalPersons':
                return 'pi-users';
            default:
                return 'pi-chart-bar';
        }
    };

    const getColor = (key: string) => {
        switch (key) {
            case 'totalOrganizations':
                return 'blue';
            case 'totalEconomicGroups':
                return 'green';
            case 'totalPersons':
                return 'orange';
            default:
                return 'gray';
        }
    };

    const getTargetPage = (key: string) => {
        switch (key) {
            case 'totalOrganizations':
                return 'organizations';
            case 'totalEconomicGroups':
                return 'economic-groups';
            default:
                return null;
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Dashboard Administrativo</h2>

            <div className="grid">
                {totals && Object.keys(totals).map((key) => {
                    const value = totals[key as keyof IDashboardTotals];
                    const title = getTitle(key);
                    const icon = getIcon(key);
                    const color = getColor(key);
                    const targetPage = getTargetPage(key);
                    const hasLink = !!(targetPage && onNavigate);

                    return (
                        <div key={key} className="col-12 md:col-6 lg:col-4">
                            <Card 
                                className={`shadow-2 border-round cursor-pointer hover:shadow-4 transition-all transition-duration-300`}
                                onClick={() => hasLink && onNavigate(targetPage)}
                            >
                                <div className="flex justify-content-between mb-3">
                                    <div>
                                        <span className="block text-500 font-medium mb-3">{title}</span>
                                        <div className="text-900 font-bold text-2xl">
                                            {loading ? <i className="pi pi-spin pi-spinner"></i> : value}
                                        </div>
                                    </div>
                                    <div className={`flex align-items-center justify-content-center bg-${color}-100 border-round`} style={{width: '3rem', height: '3rem'}}>
                                        <i className={`pi ${icon} text-${color}-500 text-2xl`}></i>
                                    </div>
                                </div>
                                <div className="flex align-items-center">
                                    <span className="text-500 font-medium">Total registrado</span>
                                    {hasLink && <i className="pi pi-arrow-right ml-auto text-500"></i>}
                                </div>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminDashboard;
