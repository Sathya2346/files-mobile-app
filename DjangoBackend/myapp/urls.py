from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('welcome/', views.welcome, name='welcome'),
    path("merge-pdf/", merge_pdfs, name="merge_pdf"),
    path("split-pdf/", split_pdf, name="split_pdf"),
    path("compress-pdf/", views.compress_pdf, name="compress_pdf"),
    path("pdf-to-word/", pdf_to_word, name="pdf-to-word"),
    path("word-to-pdf/", word_to_pdf, name="word_to_pdf"),
    path("image-to-pdf/", image_to_pdf, name="image_to_pdf"), 

    path("pdf-to-images/", pdf_to_images, name="pdf-to-images"),
    path("zip-selected-images/", zip_selected_images, name="zip_selected_images"),

    path("compress-image/", compress_image, name="compress_image"),
    path("protect-pdf/", protect_pdf, name="protect_pdf"),
    path("unlock-pdf/", unlock_pdf, name="unlock_pdf"),
    path("pdf-to-ppt/", pdf_to_ppt, name="pdf_to_ppt"),
    path("ppt-to-pdf/", ppt_to_pdf, name="ppt_to_pdf"),
    path("add-watermark/", add_watermark, name="add_watermark"),
    path("pdf-to-excel/", pdf_to_excel, name="pdf_to_excel"),
    path("excel-to-pdf/", excel_to_pdf, name="excel_to_pdf"),
    path("sign-pdf/", sign_pdf, name="sign_pdf"),
    path("pdf-to-image/", pdf_to_image, name="pdf_to_image"),

    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),

    path('profile/<int:user_id>/', get_user_profile, name='get_profile'),
    path('profile/update/<int:user_id>/', update_user_profile, name='update_profile'),  

    path('faqs/', get_faqs, name='get_faqs'),
    path('contact-info/', get_contact_info, name='get_contact_info'),
    path('submit-ticket/', submit_ticket, name='submit_ticket'),

]
