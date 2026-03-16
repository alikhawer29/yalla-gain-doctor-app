import { useState } from "react"
import { useAppSelector } from "../../hooks"
import { selectUser } from "../../redux/Slices/AuthSlice"

const useDashboardController = () => {

    const user = useAppSelector(selectUser)
    const [bookingFilter, setBookingFilter] = useState('Monthly')
    const [earningsFilter, setEarningsFilter] = useState('Monthly')

    // Dummy data for charts
    const earningsData = {
        labels: ["Jan 25", "Feb 25", "Mar 25", "Apr 25", "May 25", "Jun 25"],
        datasets: [
            {
                data: [5000, 10000, 7000, 15000, 20000, 22000],
                color: () => `rgba(26, 255, 146, 1)`,
                strokeWidth: 2
            }
        ],
    };

    const bookingsData = {
        labels: ["Jan 25", "Feb 25", "Mar 25", "Apr 25", "May 25", "Jun 25"],
        datasets: [
            {
                data: [2, 5, 3, 7, 10, 15],
                color: () => `rgba(26, 255, 146, 1)`,
                strokeWidth: 2
            }
        ],
    };

    return {
        values: {
            user,
            earningsData,
            bookingsData,
            bookingFilter,
            earningsFilter
        },
        functions: {
            setBookingFilter,
            setEarningsFilter
        }
    }
}

export default useDashboardController
