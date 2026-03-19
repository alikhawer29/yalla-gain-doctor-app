import { FlatList } from "react-native"
import images from "../../assets/images"
import HelpDeskCard from "../../components/Cards/HelpDeskCard"
import Seperator from "../../components/Seperator"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"

import { useModal } from "../../contexts/ModalContext"

const HelpDesk = () => {
    const { showRatingModal } = useModal() as any

    const HELPDESK = [
        { icon: images.helpdesk.faq, title: "FAQ's", onPress: () => navigate(ROUTES.FAQ) },
        { icon: images.helpdesk.complaint, title: "Complain Chat Bot", onPress: () => navigate(ROUTES.CHATBOT) },
        { icon: images.helpdesk.languages, title: "Choose Language", onPress: () => navigate(ROUTES.CHOOSE_LANGUAGE) },
        { icon: images.helpdesk.basic_details, title: "Basic Details", onPress: () => navigate(ROUTES.BASIC_DETAILS) },
        { icon: images.helpdesk.contact, title: "Contact Us", onPress: () => navigate(ROUTES.CONTACT_US) },
        {
            icon: images.helpdesk.rate, title: "Rate App", onPress: () => showRatingModal({
                title: "Rate App",
                message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod"
            }, (rating: number) => {
                console.log("Rated:", rating)
            })
        },
        { icon: images.helpdesk.aboutus, title: "About Us", onPress: () => navigate(ROUTES.ABOUT_US) },
    ]

    return (
        <Wrapper>
            <FlatList
                data={HELPDESK}
                renderItem={({ item }) => <HelpDeskCard {...item} />}
                numColumns={2}
                ItemSeparatorComponent={() => <Seperator />}
                columnWrapperStyle={{ gap: "3%" }}
                showsVerticalScrollIndicator={false}
            />
        </Wrapper>
    )
}

export default HelpDesk