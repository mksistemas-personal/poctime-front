import React, {useEffect, useState} from 'react';
import {DashboardService, IDashboardTotals} from "./DashboardService";
import {Card} from "primereact/card";

interface AdminDashboardProps {
    onNavigate?: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({onNavigate}) => {
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
            case 'totalClients':
                return 'Clientes';
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
            case 'totalClients':
                return 'pi-id-card';
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
            case 'totalClients':
                return 'red';
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
            case 'totalClients':
                return 'clients';
            case 'totalPersons':
                return 'people';
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
                                className={`shadow-1 border-none border-left-3 border-${color}-500 cursor-pointer hover:shadow-4 transition-all transition-duration-300 surface-card`}
                                onClick={() => hasLink && onNavigate(targetPage)}
                            >
                                <div className="flex align-items-center justify-content-between">
                                    <div className="flex flex-column">
                                        <span className="text-500 font-medium mb-1 text-sm">{title}</span>
                                        <div className="text-900 font-bold text-3xl">
                                            {loading ? <i className="pi pi-spin pi-spinner text-xl"></i> : value}
                                        </div>
                                        <div className="mt-2">
                                            <span
                                                className={`text-${color}-500 font-medium text-xs bg-${color}-50 px-2 py-1 border-round`}>
                                                Total registrado
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className={`flex align-items-center justify-content-center bg-${color}-50 border-round-xl`}
                                        style={{width: '4rem', height: '4rem'}}>
                                        <i className={`pi ${icon} text-${color}-600 text-3xl`}></i>
                                    </div>
                                </div>
                                {hasLink && (
                                    <div className="flex align-items-center mt-3 pt-3 border-top-1 surface-border">
                                        <span className="text-xs text-primary font-bold">VER DETALHES</span>
                                        <i className="pi pi-chevron-right ml-auto text-primary text-xs"></i>
                                    </div>
                                )}
                            </Card>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminDashboard;
